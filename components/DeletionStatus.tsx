import type { ReactNode } from "react";
import { Clock3, MailCheck, MailWarning, SearchCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import type { DeletionRequest } from "@/lib/database";
import { Card, CardContent } from "@/components/ui/card";

const statusMap: Record<
  DeletionRequest["status"],
  { label: string; icon: ReactNode; tone: string; description: string }
> = {
  drafted: {
    label: "Drafted",
    icon: <MailWarning size={14} />,
    tone: "bg-[rgba(255,180,80,0.15)] text-[#ffce86]",
    description: "Message template saved. SMTP is not yet configured or delivery failed."
  },
  sent: {
    label: "Sent",
    icon: <MailCheck size={14} />,
    tone: "bg-[rgba(69,196,255,0.15)] text-[var(--primary)]",
    description: "Initial deletion request sent and waiting for platform response."
  },
  awaiting_response: {
    label: "Awaiting Response",
    icon: <Clock3 size={14} />,
    tone: "bg-[rgba(69,196,255,0.15)] text-[var(--primary)]",
    description: "Follow-up sent. Waiting for compliance confirmation."
  },
  follow_up_due: {
    label: "Follow-up Due",
    icon: <MailWarning size={14} />,
    tone: "bg-[rgba(255,180,80,0.15)] text-[#ffce86]",
    description: "Next follow-up is due or previous follow-up delivery failed."
  },
  profile_still_public: {
    label: "Still Public",
    icon: <ShieldAlert size={14} />,
    tone: "bg-[rgba(255,107,121,0.15)] text-[var(--danger)]",
    description: "Profile still appears public during automated checks."
  },
  confirmed_deleted: {
    label: "Removed",
    icon: <ShieldCheck size={14} />,
    tone: "bg-[rgba(91,227,122,0.15)] text-[var(--success)]",
    description: "Profile appears deleted or inaccessible in automated checks."
  },
  manual_review: {
    label: "Manual Review",
    icon: <SearchCheck size={14} />,
    tone: "bg-[rgba(159,176,195,0.18)] text-[var(--muted)]",
    description: "Automatic workflow is paused and needs manual escalation."
  }
};

export function DeletionStatus({ request }: { request: DeletionRequest }) {
  const status = statusMap[request.status];

  return (
    <Card className="border-[var(--border)] bg-[var(--panel)]/40">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{request.platformName}</p>
            <p className="text-xs text-[var(--muted)]">{request.profileUrl}</p>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.tone}`}>
            {status.icon}
            {status.label}
          </span>
        </div>

        <p className="text-xs text-[var(--muted)]">{status.description}</p>

        <div className="grid gap-1 text-xs text-[var(--muted)]">
          <p>Created: {new Date(request.createdAt).toLocaleString()}</p>
          <p>Follow-ups sent: {request.followUpCount}</p>
          {request.nextFollowUpAt ? <p>Next follow-up: {new Date(request.nextFollowUpAt).toLocaleString()}</p> : null}
          {request.lastCheckedAt ? <p>Last scrape check: {new Date(request.lastCheckedAt).toLocaleString()}</p> : null}
          {request.emailDelivery.error ? (
            <p className="text-[var(--danger)]">Delivery issue: {request.emailDelivery.error}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
