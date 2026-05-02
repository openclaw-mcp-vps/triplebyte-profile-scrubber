"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessClient({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let mounted = true;

    async function activate() {
      setStatus("loading");

      try {
        const response = await fetch("/api/access/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });

        const payload = await response.json();

        if (!mounted) {
          return;
        }

        if (!response.ok) {
          setStatus("error");
          setMessage(payload.error || "Could not verify payment.");
          return;
        }

        setStatus("done");
        setMessage("Payment verified. Your dashboard is unlocked.");
      } catch {
        if (!mounted) {
          return;
        }

        setStatus("error");
        setMessage("Network error while verifying payment.");
      }
    }

    void activate();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6">
      <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)]/55 p-6">
        <h1 className="text-2xl font-semibold">Payment complete</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We are validating your checkout and issuing your dashboard access cookie.
        </p>

        <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm">
          {status === "loading" ? "Verifying payment..." : null}
          {status === "done" ? message : null}
          {status === "error" ? message : null}
          {status === "idle" && !sessionId
            ? "No session ID in the URL. Add ?session_id=... or unlock from the homepage form."
            : null}
        </div>

        <div className="mt-5 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[#021018]"
          >
            Open dashboard
          </Link>
          <Link
            href="/"
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
