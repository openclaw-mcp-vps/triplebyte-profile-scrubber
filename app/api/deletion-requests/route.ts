import { z } from "zod";
import { createDeletionRequests, getDashboardSummary, runDueAutomationJobs } from "@/lib/database";
import { requirePaidEmail } from "@/lib/auth-server";

export const runtime = "nodejs";

const createSchema = z.object({
  legalName: z.string().min(2),
  jurisdiction: z.enum(["gdpr", "ccpa"]),
  requests: z
    .array(
      z.object({
        platformId: z.string().min(1),
        profileUrl: z.string().url()
      })
    )
    .min(1)
});

export async function GET() {
  const email = await requirePaidEmail();

  if (!email) {
    return Response.json({ error: "Payment required" }, { status: 402 });
  }

  const automation = await runDueAutomationJobs({ email, limit: 3 });
  const dashboard = await getDashboardSummary(email);

  return Response.json({
    email,
    automation,
    ...dashboard
  });
}

export async function POST(request: Request) {
  const email = await requirePaidEmail();

  if (!email) {
    return Response.json({ error: "Payment required" }, { status: 402 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createDeletionRequests({
    userEmail: email,
    legalName: parsed.data.legalName,
    jurisdiction: parsed.data.jurisdiction,
    items: parsed.data.requests
  });

  return Response.json(
    {
      created,
      message:
        "Requests were created. If SMTP is configured, emails were sent automatically. Otherwise drafts were stored with follow-up reminders."
    },
    { status: 201 }
  );
}
