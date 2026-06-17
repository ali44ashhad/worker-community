import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Scale, AlertTriangle } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

const Card = ({ children }) => (
  <div className="rounded-3xl border border-purple-100/50 bg-white/80 p-6 shadow-lg shadow-purple-500/5 backdrop-blur-sm sm:p-8">
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, children }) => (
  <div className="mt-8">
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{title}</h2>
    </div>
    <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)]">{children}</div>
  </div>
);

const Terms = () => {
  const effectiveDate = 'June 17, 2026';

  return (
    <div className="home-page min-h-screen bg-[var(--background-subtle)]">
      <section className="relative overflow-hidden border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 pt-28 pb-16 lg:pt-32 lg:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--purple-primary)]">Legal</p>
            <h1 className="mt-2 bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Terms & Conditions
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">
              These Terms govern your access to and use of CommuN. By using the platform, you agree to these Terms.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
            Effective date: <span className="font-bold text-[var(--text-primary)]">{effectiveDate}</span>
          </p>

          <SectionTitle icon={FileText} title="About CommuN">
            <p>
              CommuN is a locality-first platform that helps community members discover and offer services, share updates,
              and participate in community activities. CommuN may include areas for customers, service providers, and
              community secretaries.
            </p>
          </SectionTitle>

          <SectionTitle icon={ShieldCheck} title="Accounts & eligibility">
            <p>
              You must provide accurate information during signup. You are responsible for maintaining the
              confidentiality of your account and for all activity under your account.
            </p>
            <p>
              Some communities require secretary approval. Your account may remain in a pending state until approved,
              and may be rejected at the secretary’s discretion, subject to applicable law.
            </p>
          </SectionTitle>

          <SectionTitle icon={Scale} title="User conduct">
            <p>Please do not:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Post unlawful, abusive, misleading, or harmful content.</li>
              <li>Impersonate others or misrepresent your identity or services.</li>
              <li>Attempt to gain unauthorized access to the platform or other users’ accounts.</li>
              <li>Use the platform to spam, harass, or solicit inappropriately.</li>
            </ul>
          </SectionTitle>

          <SectionTitle icon={AlertTriangle} title="Services, payments, and liability">
            <p>
              CommuN may facilitate discovery of local providers and services, but does not guarantee the quality,
              safety, legality, or delivery of any service. Transactions and agreements (if any) are between users.
            </p>
            <p>
              To the maximum extent permitted by law, CommuN is not liable for indirect, incidental, or consequential
              damages, or for disputes between users.
            </p>
          </SectionTitle>

          <SectionTitle icon={FileText} title="Content & intellectual property">
            <p>
              You retain ownership of the content you post. By posting content, you grant CommuN a limited license to
              host, display, and distribute it solely for operating and improving the platform.
            </p>
            <p>
              CommuN branding, UI, and software are protected by applicable intellectual property laws. Do not copy or
              reuse without permission.
            </p>
          </SectionTitle>

          <SectionTitle icon={FileText} title="Termination">
            <p>
              We may suspend or terminate accounts that violate these Terms, harm the community, or create security
              risks. You can request account deletion by contacting support.
            </p>
          </SectionTitle>

          <SectionTitle icon={FileText} title="Changes to these Terms">
            <p>
              We may update these Terms from time to time. Continued use of the platform after changes means you accept
              the updated Terms.
            </p>
          </SectionTitle>

          <div className="mt-8 rounded-2xl border border-purple-100/60 bg-purple-50/30 p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Contact</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              For questions about these Terms, contact us via the Contact page.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Terms;
