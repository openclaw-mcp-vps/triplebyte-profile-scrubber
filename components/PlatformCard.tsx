"use client";

import { AlertCircle, CheckCircle2, LinkIcon, Mail } from "lucide-react";
import type { Platform } from "@/lib/platforms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  platform: Platform;
  selected: boolean;
  profileUrl: string;
  onSelectedChange: (value: boolean) => void;
  onProfileUrlChange: (value: string) => void;
};

function statusTone(status: Platform["status"]) {
  if (status === "defunct") {
    return "bg-[rgba(255,107,121,0.15)] text-[var(--danger)]";
  }

  if (status === "acquired") {
    return "bg-[rgba(255,180,80,0.15)] text-[#ffce86]";
  }

  return "bg-[rgba(69,196,255,0.15)] text-[var(--primary)]";
}

export function PlatformCard({
  platform,
  selected,
  profileUrl,
  onSelectedChange,
  onProfileUrlChange
}: Props) {
  return (
    <Card className="border-[var(--border)] bg-[var(--panel)]/50 transition hover:border-[var(--primary)]/60">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{platform.name}</CardTitle>
          <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${statusTone(platform.status)}`}>
            {platform.status}
          </span>
        </div>
        <CardDescription>{platform.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelectedChange(event.target.checked)}
            className="h-4 w-4 rounded border border-[var(--border)] bg-[var(--bg)]"
          />
          Track this platform
        </label>

        <div className="grid gap-2 text-xs text-[var(--muted)]">
          {platform.deletionEmail ? (
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>{platform.deletionEmail}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#ffce86]">
              <AlertCircle size={14} />
              <span>No direct deletion email available</span>
            </div>
          )}
          {platform.deletionFormUrl ? (
            <a
              href={platform.deletionFormUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[var(--primary)] underline-offset-2 hover:underline"
            >
              <LinkIcon size={14} />
              Privacy policy / request form
            </a>
          ) : null}
        </div>

        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">Public profile URL to monitor</span>
          <input
            type="url"
            value={profileUrl}
            onChange={(event) => onProfileUrlChange(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-0 focus:border-[var(--primary)]"
          />
        </label>

        <div className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
          <CheckCircle2 size={13} />
          Automated follow-up every {platform.followUpDays} days
        </div>
      </CardContent>
    </Card>
  );
}
