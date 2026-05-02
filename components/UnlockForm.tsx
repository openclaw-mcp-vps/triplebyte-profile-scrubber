"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UnlockForm({ defaultSessionId = "" }: { defaultSessionId?: string }) {
  const [sessionId, setSessionId] = useState(defaultSessionId);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/access/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          email: email || undefined
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Unable to unlock dashboard.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error while verifying payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUnlock} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--panel)]/50 p-4">
      <h3 className="text-sm font-semibold">Already paid? Unlock dashboard</h3>
      <p className="text-xs text-[var(--muted)]">
        Paste your Stripe <code>session_id</code> from the success redirect, or enter the same checkout email.
      </p>

      <label className="block space-y-1 text-xs">
        <span className="text-[var(--muted)]">Checkout session ID</span>
        <input
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
          placeholder="cs_test_..."
        />
      </label>

      <label className="block space-y-1 text-xs">
        <span className="text-[var(--muted)]">Or email used at checkout</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
          placeholder="you@example.com"
        />
      </label>

      {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Verifying..." : "Unlock Dashboard"}
      </Button>
    </form>
  );
}
