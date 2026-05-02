import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { buildFollowUpDeletionEmail, buildInitialDeletionEmail } from "@/lib/email-templates";
import { sendDeletionEmail } from "@/lib/mailer";
import { getPlatformById, PLATFORMS, type RequestJurisdiction } from "@/lib/platforms";
import { checkProfileVisibility } from "@/lib/scraper";

export type DeletionRequestStatus =
  | "drafted"
  | "sent"
  | "awaiting_response"
  | "follow_up_due"
  | "profile_still_public"
  | "confirmed_deleted"
  | "manual_review";

export type DeletionRequest = {
  id: string;
  platformId: string;
  platformName: string;
  userEmail: string;
  legalName: string;
  jurisdiction: RequestJurisdiction;
  profileUrl: string;
  status: DeletionRequestStatus;
  createdAt: string;
  updatedAt: string;
  nextFollowUpAt: string | null;
  lastCheckedAt: string | null;
  followUpCount: number;
  emailSubject: string;
  emailBody: string;
  emailDelivery: {
    delivered: boolean;
    attemptedAt: string;
    messageId?: string;
    error?: string;
  };
  scrape: {
    stillPublic: boolean | null;
    httpStatus: number | null;
    title: string | null;
    indicator: string | null;
    checkedAt: string | null;
    error?: string;
  };
  history: Array<{
    at: string;
    type: string;
    note: string;
  }>;
};

type Store = {
  paidEmails: Record<
    string,
    {
      paidAt: string;
      source: string;
      sessionIds: string[];
    }
  >;
  paidSessions: Record<
    string,
    {
      email: string;
      paidAt: string;
      source: string;
    }
  >;
  deletionRequests: DeletionRequest[];
};

const STORE_PATH = path.join(process.cwd(), "data", "store.json");
const STORE_DIR = path.dirname(STORE_PATH);

const DEFAULT_STORE: Store = {
  paidEmails: {},
  paidSessions: {},
  deletionRequests: []
};

let writeQueue: Promise<unknown> = Promise.resolve();

function withDays(dateISO: string, days: number) {
  const date = new Date(dateISO);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function daysBetween(startISO: string, endISO: string) {
  return Math.max(1, Math.floor((new Date(endISO).getTime() - new Date(startISO).getTime()) / (1000 * 60 * 60 * 24)));
}

async function ensureStoreFile() {
  await mkdir(STORE_DIR, { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
  }
}

async function readStore(): Promise<Store> {
  await ensureStoreFile();
  const raw = await readFile(STORE_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as Store;

    return {
      paidEmails: parsed.paidEmails || {},
      paidSessions: parsed.paidSessions || {},
      deletionRequests: parsed.deletionRequests || []
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

async function writeStore(store: Store) {
  await ensureStoreFile();
  const tempPath = `${STORE_PATH}.tmp`;
  await writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await rename(tempPath, STORE_PATH);
}

function mutateStore<T>(mutator: (store: Store) => Promise<T> | T): Promise<T> {
  const task = writeQueue.then(async () => {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return result;
  });

  writeQueue = task.then(
    () => undefined,
    () => undefined
  );

  return task;
}

export async function getPaidEmailForSession(sessionId: string) {
  const store = await readStore();
  return store.paidSessions[sessionId]?.email || null;
}

export async function hasPaidAccess(email: string) {
  const store = await readStore();
  return Boolean(store.paidEmails[email.toLowerCase()]);
}

export async function markPaymentCompleted({
  email,
  sessionId,
  source
}: {
  email: string;
  sessionId: string;
  source: string;
}) {
  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail || !sessionId) {
    return;
  }

  await mutateStore(async (store) => {
    const now = new Date().toISOString();

    const existingEmailRecord = store.paidEmails[normalizedEmail];

    if (!existingEmailRecord) {
      store.paidEmails[normalizedEmail] = {
        paidAt: now,
        source,
        sessionIds: [sessionId]
      };
    } else if (!existingEmailRecord.sessionIds.includes(sessionId)) {
      existingEmailRecord.sessionIds.push(sessionId);
    }

    store.paidSessions[sessionId] = {
      email: normalizedEmail,
      paidAt: now,
      source
    };
  });
}

export async function listDeletionRequestsForEmail(email: string) {
  const store = await readStore();
  const normalizedEmail = email.toLowerCase();

  return store.deletionRequests
    .filter((request) => request.userEmail === normalizedEmail)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function createDeletionRequests(input: {
  userEmail: string;
  legalName: string;
  jurisdiction: RequestJurisdiction;
  items: Array<{ platformId: string; profileUrl: string }>;
}) {
  const now = new Date().toISOString();
  const normalizedEmail = input.userEmail.toLowerCase().trim();

  if (!normalizedEmail || !input.legalName.trim()) {
    throw new Error("A valid email and legal name are required.");
  }

  return mutateStore(async (store) => {
    const created: DeletionRequest[] = [];

    for (const item of input.items) {
      const platform = getPlatformById(item.platformId);

      if (!platform) {
        continue;
      }

      const template = buildInitialDeletionEmail({
        platform,
        legalName: input.legalName,
        requesterEmail: normalizedEmail,
        profileUrl: item.profileUrl,
        jurisdiction: input.jurisdiction
      });

      let delivery = {
        delivered: false,
        attemptedAt: now,
        error: "No deletion email configured for this platform."
      } as DeletionRequest["emailDelivery"];

      let status: DeletionRequestStatus = platform.deletionEmail ? "drafted" : "manual_review";
      let nextFollowUpAt: string | null = null;

      if (platform.deletionEmail) {
        const result = await sendDeletionEmail({
          to: platform.deletionEmail,
          subject: template.subject,
          text: template.body,
          requesterEmail: normalizedEmail
        });

        delivery = {
          delivered: result.delivered,
          attemptedAt: now,
          messageId: result.messageId,
          error: result.error
        };

        status = result.delivered ? "sent" : "drafted";
        nextFollowUpAt = result.delivered ? withDays(now, platform.followUpDays) : withDays(now, 1);
      }

      const request: DeletionRequest = {
        id: randomUUID(),
        platformId: platform.id,
        platformName: platform.name,
        userEmail: normalizedEmail,
        legalName: input.legalName.trim(),
        jurisdiction: input.jurisdiction,
        profileUrl: item.profileUrl.trim(),
        status,
        createdAt: now,
        updatedAt: now,
        nextFollowUpAt,
        lastCheckedAt: null,
        followUpCount: 0,
        emailSubject: template.subject,
        emailBody: template.body,
        emailDelivery: delivery,
        scrape: {
          stillPublic: null,
          httpStatus: null,
          title: null,
          indicator: null,
          checkedAt: null
        },
        history: [
          {
            at: now,
            type: "request_created",
            note: delivery.delivered
              ? "Initial deletion request email sent successfully."
              : `Initial deletion request drafted. ${delivery.error || "Delivery pending."}`
          }
        ]
      };

      store.deletionRequests.push(request);
      created.push(request);
    }

    return created;
  });
}

export async function runDueAutomationJobs(options?: { email?: string; limit?: number }) {
  const now = new Date().toISOString();
  const limit = options?.limit ?? 3;

  return mutateStore(async (store) => {
    const matches = store.deletionRequests.filter((request) => {
      if (options?.email && request.userEmail !== options.email.toLowerCase()) {
        return false;
      }

      if (!request.nextFollowUpAt) {
        return false;
      }

      return new Date(request.nextFollowUpAt).getTime() <= new Date(now).getTime();
    });

    const toProcess = matches.slice(0, limit);

    for (const request of toProcess) {
      const platform = getPlatformById(request.platformId);

      if (!platform) {
        request.status = "manual_review";
        request.updatedAt = now;
        request.history.push({
          at: now,
          type: "platform_missing",
          note: "Platform metadata missing. Manual review required."
        });
        continue;
      }

      const scrapeResult = await checkProfileVisibility(platform, request.profileUrl);

      request.scrape = {
        stillPublic: scrapeResult.stillPublic,
        httpStatus: scrapeResult.httpStatus,
        title: scrapeResult.title,
        indicator: scrapeResult.indicator,
        checkedAt: scrapeResult.checkedAt,
        error: scrapeResult.error
      };
      request.lastCheckedAt = scrapeResult.checkedAt;

      if (scrapeResult.stillPublic === false) {
        request.status = "confirmed_deleted";
        request.nextFollowUpAt = null;
        request.updatedAt = now;
        request.history.push({
          at: now,
          type: "deletion_confirmed",
          note: "Profile appears removed or inaccessible to public scraping checks."
        });
        continue;
      }

      if (!platform.deletionEmail) {
        request.status = "manual_review";
        request.nextFollowUpAt = null;
        request.updatedAt = now;
        request.history.push({
          at: now,
          type: "manual_follow_up_required",
          note: "No automated follow-up channel for this platform."
        });
        continue;
      }

      if (request.followUpCount >= 4) {
        request.status = "manual_review";
        request.nextFollowUpAt = null;
        request.updatedAt = now;
        request.history.push({
          at: now,
          type: "follow_up_limit_reached",
          note: "Reached automated follow-up cap. Escalate manually."
        });
        continue;
      }

      const followTemplate = buildFollowUpDeletionEmail(
        {
          platform,
          legalName: request.legalName,
          requesterEmail: request.userEmail,
          profileUrl: request.profileUrl,
          jurisdiction: request.jurisdiction
        },
        daysBetween(request.createdAt, now)
      );

      const mailResult = await sendDeletionEmail({
        to: platform.deletionEmail,
        subject: followTemplate.subject,
        text: followTemplate.body,
        requesterEmail: request.userEmail
      });

      request.followUpCount += 1;
      request.updatedAt = now;
      request.nextFollowUpAt = withDays(now, platform.followUpDays);
      request.status = mailResult.delivered
        ? scrapeResult.stillPublic
          ? "profile_still_public"
          : "awaiting_response"
        : "follow_up_due";
      request.emailSubject = followTemplate.subject;
      request.emailBody = followTemplate.body;
      request.emailDelivery = {
        delivered: mailResult.delivered,
        attemptedAt: now,
        messageId: mailResult.messageId,
        error: mailResult.error
      };
      request.history.push({
        at: now,
        type: "follow_up_sent",
        note: mailResult.delivered
          ? "Automated follow-up email sent after scrape check."
          : `Follow-up delivery failed: ${mailResult.error || "unknown error"}`
      });
    }

    return {
      processed: toProcess.length,
      queued: matches.length
    };
  });
}

export async function getPlatformCatalog() {
  return PLATFORMS;
}

export async function getDashboardSummary(email: string) {
  const requests = await listDeletionRequestsForEmail(email);

  const counts = requests.reduce(
    (acc, request) => {
      acc.total += 1;
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    },
    {
      total: 0,
      drafted: 0,
      sent: 0,
      awaiting_response: 0,
      follow_up_due: 0,
      profile_still_public: 0,
      confirmed_deleted: 0,
      manual_review: 0
    } as Record<string, number>
  );

  return {
    counts,
    requests
  };
}
