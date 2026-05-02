import Link from "next/link";
import { AlertTriangle, Bot, FileSearch, Lock, ShieldCheck, TimerReset } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";
import { UnlockForm } from "@/components/UnlockForm";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-20" />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)]/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              Privacy Tools
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[var(--text)] md:text-6xl">
              Remove your data from defunct recruiting platforms
            </h1>
            <p className="mt-5 max-w-2xl text-base text-[var(--muted)] md:text-lg">
              Triplebyte Profile Scrubber automates GDPR/CCPA deletion requests, tracks compliance deadlines, and
              keeps re-checking old profile links until they stop being publicly visible.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[#021018] hover:bg-[var(--primary-strong)]"
              >
                Open Dashboard
              </Link>
              <a
                href="#pricing"
                className="rounded-md border border-[var(--border)] bg-[var(--panel)]/60 px-5 py-3 text-sm text-[var(--text)] hover:border-[var(--primary)]"
              >
                View Pricing
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-4">
                <p className="text-2xl font-semibold">6+</p>
                <p className="text-sm text-[var(--muted)]">Legacy platforms monitored</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-4">
                <p className="text-2xl font-semibold">14 days</p>
                <p className="text-sm text-[var(--muted)]">Default follow-up cadence</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-4">
                <p className="text-2xl font-semibold">1 dashboard</p>
                <p className="text-sm text-[var(--muted)]">For all deletion evidence</p>
              </div>
            </div>
          </div>

          <div className="fade-in space-y-4">
            <PricingCard />
            <UnlockForm />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        <article className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-6">
          <AlertTriangle className="mb-3 text-[var(--danger)]" size={20} />
          <h2 className="text-lg font-semibold">Problem</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Old recruiting profiles can become public again when companies shut down, merge systems, or leave stale
            exports online.
          </p>
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-6">
          <Bot className="mb-3 text-[var(--primary)]" size={20} />
          <h2 className="text-lg font-semibold">Solution</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            We send legal deletion emails, monitor profile URLs with automated checks, and trigger follow-ups on your
            behalf.
          </p>
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-6">
          <ShieldCheck className="mb-3 text-[var(--success)]" size={20} />
          <h2 className="text-lg font-semibold">Outcome</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            You get an auditable timeline of every request and confirmation so you can escalate with confidence.
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-semibold">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-5">
            <Lock size={18} className="mb-2 text-[var(--primary)]" />
            <h3 className="font-medium">1. Add your old profile URLs</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Select platforms and provide links that should no longer be public.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-5">
            <TimerReset size={18} className="mb-2 text-[var(--primary)]" />
            <h3 className="font-medium">2. Send and schedule follow-ups</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              The app sends deletion requests and schedules legal follow-ups until each platform responds.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/45 p-5">
            <FileSearch size={18} className="mb-2 text-[var(--primary)]" />
            <h3 className="font-medium">3. Monitor for compliance</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Automated checks detect whether profile pages remain visible and update your dashboard status.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-4 text-2xl font-semibold">Pricing</h2>
        <p className="mb-6 max-w-2xl text-sm text-[var(--muted)]">
          One plan focused on engineers and job seekers who need to regain control over dormant recruiting data.
        </p>
        <div className="max-w-xl">
          <PricingCard />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-5 text-2xl font-semibold">FAQ</h2>
        <div className="space-y-3">
          <details className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/45 p-4">
            <summary className="cursor-pointer font-medium">Does this guarantee deletion?</summary>
            <p className="mt-2 text-sm text-[var(--muted)]">
              No service can force compliance instantly, but it does ensure requests are correctly sent, documented,
              and repeatedly followed up with clear legal language.
            </p>
          </details>
          <details className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/45 p-4">
            <summary className="cursor-pointer font-medium">What do I need to configure?</summary>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Add your Stripe payment link and webhook secret. For direct outbound email delivery, configure SMTP
              credentials.
            </p>
          </details>
          <details className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/45 p-4">
            <summary className="cursor-pointer font-medium">Can I use CCPA instead of GDPR?</summary>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Yes. The dashboard lets you choose GDPR or CCPA wording for each request batch.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
