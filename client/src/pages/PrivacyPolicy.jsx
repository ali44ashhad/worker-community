import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Database, Cookie, Users, Mail } from 'lucide-react';

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

const PrivacyPolicy = () => {
  const effectiveDate = 'June 17, 2026';

  return (
    <div className="home-page min-h-screen bg-[var(--background-subtle)]">
      <section className="relative overflow-hidden border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 pt-8 pb-16 lg:pt-10 lg:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--purple-primary)]">Legal</p>
            <h1 className="mt-2 bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">
              This Policy explains how CommuN collects, uses, and protects your information.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
            Effective date: <span className="font-bold text-[var(--text-primary)]">{effectiveDate}</span>
          </p>

          <SectionTitle icon={Shield} title="What we collect">
            <p>
              We collect information you provide such as name, email, phone number, community selection, and profile
              details. If you apply as a provider, we may collect additional business/service information.
            </p>
            <p>
              We also collect basic technical data (e.g., device, browser, IP address) and usage information to keep the
              platform secure and improve performance.
            </p>
          </SectionTitle>

          <SectionTitle icon={Database} title="How we use your information">
            <ul className="list-disc space-y-2 pl-5">
              <li>To create and manage your account and community access.</li>
              <li>To support secretary approvals and community safety.</li>
              <li>To provide core features (services discovery, community events, broadcasts, etc.).</li>
              <li>To communicate important account/service updates (e.g., password resets, approvals).</li>
              <li>To prevent fraud, abuse, and security incidents.</li>
            </ul>
          </SectionTitle>

          <SectionTitle icon={Users} title="Sharing & disclosure">
            <p>
              We may share limited information within your community as required for platform functionality (e.g., a
              secretary reviewing pending registrations; basic profile details for trusted interactions).
            </p>
            <p>
              We do not sell your personal information. We may share data with service providers (e.g., email delivery,
              hosting) strictly to operate the platform, under appropriate safeguards.
            </p>
          </SectionTitle>

          <SectionTitle icon={Cookie} title="Cookies">
            <p>
              We use cookies and similar technologies to keep you signed in, remember preferences, and protect sessions.
              You can manage cookies through your browser settings, but some features may not work correctly without
              them.
            </p>
          </SectionTitle>

          <SectionTitle icon={Shield} title="Data retention & security">
            <p>
              We retain data as long as needed to provide the service and comply with legal obligations. We use
              reasonable security measures to protect your information, but no system is 100% secure.
            </p>
          </SectionTitle>

          <SectionTitle icon={Mail} title="Your choices">
            <p>
              You can update your profile information in the app. For account deletion requests or privacy questions,
              contact us through the Contact page.
            </p>
          </SectionTitle>

          <div className="mt-8 rounded-2xl border border-purple-100/60 bg-purple-50/30 p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Contact</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              If you have questions about this Privacy Policy, please contact us via the Contact page.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
