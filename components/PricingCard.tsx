import { ArrowRight, Shield } from "lucide-react";

export function PricingCard() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <div className="rounded-2xl border border-[var(--primary)]/30 bg-[linear-gradient(145deg,rgba(69,196,255,0.12),rgba(22,31,48,0.8))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(69,196,255,0.16)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
        <Shield size={14} />
        Privacy Tools Plan
      </div>
      <h3 className="text-2xl font-semibold">$29/month</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Send deletion requests, auto-run compliance checks, and keep a full evidence timeline for stale recruiting
        profiles.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-[var(--text)]">
        <li>Automated GDPR/CCPA request templates</li>
        <li>Multi-platform tracking dashboard</li>
        <li>Scheduled follow-up emails and scrape checks</li>
        <li>Evidence history for escalation</li>
      </ul>
      <a
        href={paymentLink}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[#021018] hover:bg-[var(--primary-strong)]"
      >
        Buy Access
        <ArrowRight size={16} />
      </a>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Use a Stripe success URL that includes <code>?session_id={"{CHECKOUT_SESSION_ID}"}</code> and return to
        <code> /success</code> to unlock instantly.
      </p>
    </div>
  );
}
