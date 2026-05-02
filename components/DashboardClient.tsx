"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw, ShieldAlert } from "lucide-react";
import type { Platform } from "@/lib/platforms";
import type { DeletionRequest } from "@/lib/database";
import { PlatformCard } from "@/components/PlatformCard";
import { DeletionStatus } from "@/components/DeletionStatus";
import { Button } from "@/components/ui/button";

type DashboardResponse = {
  email: string;
  automation: { processed: number; queued: number };
  counts: Record<string, number>;
  requests: DeletionRequest[];
};

export default function DashboardPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ total: 0 });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [automationNote, setAutomationNote] = useState("");

  const [legalName, setLegalName] = useState("");
  const [jurisdiction, setJurisdiction] = useState<"gdpr" | "ccpa">("gdpr");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({});
  const [profileUrls, setProfileUrls] = useState<Record<string, string>>({});

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [platformResponse, dashboardResponse] = await Promise.all([
        fetch("/api/platforms"),
        fetch("/api/deletion-requests")
      ]);

      const platformPayload = await platformResponse.json();
      const dashboardPayload = (await dashboardResponse.json()) as DashboardResponse | { error: string };

      if (!platformResponse.ok) {
        throw new Error("Could not load platform catalog.");
      }

      setPlatforms(platformPayload.platforms || []);

      if (!dashboardResponse.ok) {
        const serverError = "error" in dashboardPayload ? dashboardPayload.error : "";
        setError(
          dashboardResponse.status === 402
            ? "Dashboard is locked. Complete checkout and unlock first."
            : serverError || "Could not load dashboard data."
        );
        return;
      }

      if ("error" in dashboardPayload) {
        setError(dashboardPayload.error || "Could not load dashboard data.");
        return;
      }

      setEmail(dashboardPayload.email);
      setRequests(dashboardPayload.requests || []);
      setCounts(dashboardPayload.counts || { total: 0 });
      setAutomationNote(
        dashboardPayload.automation?.processed
          ? `Automation processed ${dashboardPayload.automation.processed} due job(s).`
          : "Automation is up to date."
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selectedCount = useMemo(
    () => Object.values(selectedPlatforms).filter(Boolean).length,
    [selectedPlatforms]
  );

  async function submitRequests(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const selectedItems = Object.entries(selectedPlatforms)
      .filter(([, isSelected]) => isSelected)
      .map(([platformId]) => ({
        platformId,
        profileUrl: (profileUrls[platformId] || "").trim()
      }));

    if (!legalName.trim()) {
      setError("Your legal name is required in deletion requests.");
      return;
    }

    if (!selectedItems.length) {
      setError("Select at least one platform.");
      return;
    }

    for (const item of selectedItems) {
      try {
        new URL(item.profileUrl);
      } catch {
        setError(`Invalid URL for platform ${item.platformId}.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/deletion-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          jurisdiction,
          requests: selectedItems
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error?.formErrors?.[0] || payload.error || "Failed to create requests.");
        return;
      }

      setSuccess(`Created ${payload.created?.length || 0} deletion request(s).`);
      await loadData();
    } catch {
      setError("Network error while creating requests.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Deletion Operations Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Build, send, and monitor legal deletion requests across old recruiting platforms.
          </p>
          {email ? <p className="mt-1 text-xs text-[var(--muted)]">Access granted for: {email}</p> : null}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void loadData()} disabled={loading}>
            <RefreshCcw size={14} className="mr-2" />
            Refresh
          </Button>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)]"
          >
            Home
          </Link>
        </div>
      </div>

      {automationNote ? (
        <div className="mb-6 rounded-md border border-[var(--border)] bg-[var(--panel)]/50 p-3 text-xs text-[var(--muted)]">
          {automationNote}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-md border border-[var(--danger)]/35 bg-[rgba(255,107,121,0.1)] p-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-4 rounded-md border border-[var(--success)]/35 bg-[rgba(91,227,122,0.1)] p-3 text-sm text-[var(--success)]">
          {success}
        </div>
      ) : null}

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/45 p-4">
          <p className="text-xs text-[var(--muted)]">Total Requests</p>
          <p className="text-2xl font-semibold">{counts.total || 0}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/45 p-4">
          <p className="text-xs text-[var(--muted)]">Pending Follow-up</p>
          <p className="text-2xl font-semibold">{(counts.follow_up_due || 0) + (counts.profile_still_public || 0)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/45 p-4">
          <p className="text-xs text-[var(--muted)]">Confirmed Removed</p>
          <p className="text-2xl font-semibold">{counts.confirmed_deleted || 0}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/45 p-4">
          <p className="text-xs text-[var(--muted)]">Needs Manual Review</p>
          <p className="text-2xl font-semibold">{counts.manual_review || 0}</p>
        </div>
      </section>

      <section className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--panel)]/50 p-5">
        <h2 className="text-xl font-semibold">Create Deletion Requests</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Select platforms, paste profile URLs, and send legally formatted deletion requests.
        </p>

        <form onSubmit={submitRequests} className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-[var(--muted)]">Legal name</span>
              <input
                value={legalName}
                onChange={(event) => setLegalName(event.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
                placeholder="Jane Doe"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[var(--muted)]">Jurisdiction</span>
              <select
                value={jurisdiction}
                onChange={(event) => setJurisdiction(event.target.value as "gdpr" | "ccpa")}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
              >
                <option value="gdpr">GDPR (EU/EEA)</option>
                <option value="ccpa">CCPA / CPRA (California)</option>
              </select>
            </label>
          </div>

          <p className="text-sm text-[var(--muted)]">Selected platforms: {selectedCount}</p>

          <div className="grid gap-4 lg:grid-cols-2">
            {platforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                selected={Boolean(selectedPlatforms[platform.id])}
                profileUrl={profileUrls[platform.id] || ""}
                onSelectedChange={(value) =>
                  setSelectedPlatforms((previous) => ({
                    ...previous,
                    [platform.id]: value
                  }))
                }
                onProfileUrlChange={(value) =>
                  setProfileUrls((previous) => ({
                    ...previous,
                    [platform.id]: value
                  }))
                }
              />
            ))}
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating requests..." : "Create Requests"}
          </Button>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert size={16} />
          <h2 className="text-xl font-semibold">Request Status</h2>
        </div>

        {loading ? <p className="text-sm text-[var(--muted)]">Loading dashboard data...</p> : null}

        {!loading && requests.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No requests yet. Create your first batch above.</p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          {requests.map((request) => (
            <DeletionStatus key={request.id} request={request} />
          ))}
        </div>
      </section>
    </main>
  );
}
