import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Database,
  Cookie,
  Users,
  Mail,
  Smartphone,
  Trash2,
  Baby,
  Scale,
  Building2,
} from 'lucide-react';

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
  const effectiveDate = 'September 30, 2026';
  const contactEmail = 'info@commun.in';
  const grievanceEmail = 'info@commun.in';
  const operatorName = 'CommuN';
  const webDeleteUrl = 'https://www.commun.in/delete-account';
  const googlePrivacyUrl = 'https://policies.google.com/privacy';

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
              This Policy explains how CommuN collects, uses, and protects your information across our website and
              mobile applications.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
            Effective date: <span className="font-bold text-[var(--text-primary)]">{effectiveDate}</span>
          </p>

          <SectionTitle icon={Building2} title="Operator & contact">
            <p>
              The CommuN platform (website and mobile apps) is operated by <strong>{operatorName}</strong>.
            </p>
            <p>
              Contact email:{' '}
              <a className="font-semibold text-[var(--purple-primary)] hover:underline" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </p>
            <p>
              You may also reach us through the{' '}
              <Link to="/contact" className="font-semibold text-[var(--purple-primary)] hover:underline">
                Contact
              </Link>{' '}
              page.
            </p>
          </SectionTitle>

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

          <SectionTitle icon={Smartphone} title="Mobile app data">
            <p>When you use the CommuN mobile app, we may process:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Device identifiers</strong> — such as a device ID or push registration token used to deliver
                notifications and keep your session secure.
              </li>
              <li>
                <strong>Push notifications</strong> — notification tokens and related delivery metadata so we can send
                account, community, and chat alerts you opt into.
              </li>
              <li>
                <strong>Crash / diagnostic logs</strong> — limited technical logs (for example app version, OS, and
                crash stack traces) to diagnose failures and improve stability. These are not used to sell your data.
              </li>
            </ul>
            <p>
              You can disable push notifications in your device settings. Some core security and reliability features
              may still require limited technical data to function.
            </p>
          </SectionTitle>

          <SectionTitle icon={Database} title="Firebase & Google services">
            <p>
              Our mobile apps use Google Firebase services to operate reliably. Depending on your device and settings,
              this may include:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Firebase Cloud Messaging (push notifications)</li>
              <li>Firebase App / core services required to run Firebase on your device</li>
            </ul>
            <p>
              Google may process certain technical data according to Google&apos;s own policies. See Google&apos;s
              Privacy Policy:{' '}
              <a
                className="font-semibold text-[var(--purple-primary)] hover:underline"
                href={googlePrivacyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {googlePrivacyUrl}
              </a>
            </p>
          </SectionTitle>

          <SectionTitle icon={Database} title="How we use your information">
            <ul className="list-disc space-y-2 pl-5">
              <li>To create and manage your account and community access.</li>
              <li>To support secretary approvals and community safety.</li>
              <li>To provide core features (services discovery, community events, broadcasts, chat, etc.).</li>
              <li>To communicate important account/service updates (e.g., password resets, approvals, notifications).</li>
              <li>To prevent fraud, abuse, and security incidents, and to improve app reliability.</li>
            </ul>
          </SectionTitle>

          <SectionTitle icon={Users} title="Sharing & disclosure">
            <p>
              We may share limited information within your community as required for platform functionality (e.g., a
              secretary reviewing pending registrations; basic profile details for trusted interactions).
            </p>
            <p>
              We do not sell your personal information. We may share data with service providers (e.g., email delivery,
              hosting, Firebase/Google Cloud Messaging) strictly to operate the platform, under appropriate safeguards.
            </p>
          </SectionTitle>

          <SectionTitle icon={Cookie} title="Cookies">
            <p>
              On the website, we use cookies and similar technologies to keep you signed in, remember preferences, and
              protect sessions. You can manage cookies through your browser settings, but some features may not work
              correctly without them.
            </p>
          </SectionTitle>

          <SectionTitle icon={Shield} title="Data retention & security">
            <p>
              We retain data as long as needed to provide the service and comply with legal obligations. We use
              reasonable security measures to protect your information, but no system is 100% secure.
            </p>
          </SectionTitle>

          <SectionTitle icon={Trash2} title="Account deletion">
            <p>You can request deletion of your CommuN account as follows:</p>
            <p>
              Full step-by-step instructions:{' '}
              <Link to="/delete-account" className="font-semibold text-[var(--purple-primary)] hover:underline">
                Delete Account
              </Link>{' '}
              (
              <a
                className="font-semibold text-[var(--purple-primary)] hover:underline"
                href={webDeleteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {webDeleteUrl}
              </a>
              ).
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>In the mobile app:</strong> Settings → Security &amp; Password → Delete Account (where available
                for your role).
              </li>
              <li>
                <strong>On the website:</strong> after signing in, go to Update Profile → Delete my account. See the{' '}
                <Link to="/delete-account" className="font-semibold text-[var(--purple-primary)] hover:underline">
                  Delete Account
                </Link>{' '}
                page for detailed steps.
              </li>
              <li>
                <strong>By email:</strong> write to{' '}
                <a className="font-semibold text-[var(--purple-primary)] hover:underline" href={`mailto:${contactEmail}`}>
                  {contactEmail}
                </a>{' '}
                from your registered email address and request account deletion.
              </li>
            </ul>
            <p>
              <strong>Timeframe:</strong> Self-serve deletion (where available) is processed immediately after you
              confirm with your password. Email deletion requests are completed within <strong>30 days</strong>. Some
              residual copies in encrypted backups or logs may be cleared on a rolling backup cycle, and certain
              community content (for example events or chat attributed to “Former member”) may remain where needed for
              community continuity or legal compliance. Secretary and admin accounts cannot be self-deleted from the
              app; contact us for assistance.
            </p>
          </SectionTitle>

          

          <SectionTitle icon={Scale} title="Your rights & grievance redressal">
            <p>Subject to applicable law (including India’s digital personal data protection rules), you may:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Access and review personal information associated with your account.</li>
              <li>Correct inaccurate profile details from Update Profile / Edit Profile.</li>
              <li>Withdraw consent for optional processing (for example push notifications) where applicable.</li>
              <li>Request deletion of your account as described above.</li>
            </ul>
            <p>
              For privacy questions, data requests, or grievances, email our grievance contact:{' '}
              <a
                className="font-semibold text-[var(--purple-primary)] hover:underline"
                href={`mailto:${grievanceEmail}`}
              >
                {grievanceEmail}
              </a>
              . We aim to acknowledge and address grievances in a reasonable time.
            </p>
          </SectionTitle>

          <SectionTitle icon={Mail} title="Your choices">
            <p>
              You can update your profile information in the app or on the website. For account deletion requests or
              privacy questions, use the paths above or contact us through the Contact page.
            </p>
          </SectionTitle>

          <div className="mt-8 rounded-2xl border border-purple-100/60 bg-purple-50/30 p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Contact</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Operator: {operatorName}. Email:{' '}
              <a className="font-semibold text-[var(--purple-primary)] hover:underline" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
              . Effective date: {effectiveDate}.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
