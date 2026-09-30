import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Trash2,
  Smartphone,
  Globe,
  Mail,
  AlertTriangle,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

const Card = ({ children, className = '' }) => (
  <div
    className={`rounded-3xl border border-purple-100/50 bg-white/80 p-6 shadow-lg shadow-purple-500/5 backdrop-blur-sm sm:p-8 ${className}`}
  >
    {children}
  </div>
);

const Step = ({ number, title, children }) => (
  <div className="flex gap-4">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] text-sm font-bold text-white">
      {number}
    </div>
    <div className="min-w-0 flex-1 space-y-2">
      <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--text-secondary)]">{children}</div>
    </div>
  </div>
);

const DeleteAccount = () => {
  const user = useSelector((state) => state.auth.user);
  const contactEmail = 'info@commun.in';
  const canSelfDelete = user && ['customer', 'provider'].includes(user.role);

  const profilePath =
    user?.role === 'provider'
      ? '/provider/update-profile'
      : user?.role === 'customer'
        ? '/community/update-profile'
        : '/update-profile';

  return (
    <div className="home-page min-h-screen bg-[var(--background-subtle)]">
      <section className="relative overflow-hidden border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 pt-8 pb-16 lg:pt-10 lg:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--purple-primary)]">
              Account
            </p>
            <h1 className="mt-2 bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Delete Account
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">
              Follow these steps to permanently delete your CommuN account and associated personal data.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <Card>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm leading-relaxed text-amber-900">
              <p className="font-semibold">Deletion is permanent</p>
              <p className="mt-1">
                Once deleted, your login, profile, wishlist, and notifications are removed and cannot be restored.
                Some community content (events or chat) may remain labeled as “Former member.”
              </p>
            </div>
          </div>

          {user && canSelfDelete && (
            <div className="mt-6">
              <Link
                to={profilePath}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              >
                <Trash2 className="h-4 w-4" />
                Go to Delete Account
              </Link>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Opens Update Profile → scroll to <strong>Delete account</strong>.
              </p>
            </div>
          )}

          {user && !canSelfDelete && (
            <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/40 p-4 text-sm text-[var(--text-secondary)]">
              Secretary and admin accounts cannot be self-deleted. Email{' '}
              <a className="font-semibold text-[var(--purple-primary)] hover:underline" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>{' '}
              for assistance.
            </div>
          )}

          {!user && (
            <div className="mt-6">
              <Link
                to="/login"
                state={{ from: '/delete-account' }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              >
                <LogIn className="h-4 w-4" />
                Sign in to delete your account
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              Delete on the website
            </h2>
          </div>

          <div className="space-y-6">
            <Step number="1" title="Sign in to CommuN">
              <p>
                Open{' '}
                <Link to="/login" className="font-semibold text-[var(--purple-primary)] hover:underline">
                  Login
                </Link>{' '}
                and sign in with the account you want to delete.
              </p>
            </Step>
            <Step number="2" title="Open Update Profile">
              <p>
                Go to{' '}
                <Link to="/update-profile" className="font-semibold text-[var(--purple-primary)] hover:underline">
                  Update Profile
                </Link>
                , or use the menu: Profile → Update Profile.
              </p>
              <p>
                Direct link after login:{' '}
                <a
                  href="https://www.commun.in/update-profile"
                  className="font-semibold text-[var(--purple-primary)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.commun.in/update-profile
                </a>
              </p>
            </Step>
            <Step number="3" title="Choose Delete my account">
              <p>
                Scroll to the <strong>Delete account</strong> section and tap <strong>Delete my account</strong>.
              </p>
            </Step>
            <Step number="4" title="Confirm with your password">
              <p>
                Enter your current password, type the confirmation text if asked, then confirm. Your account is deleted
                immediately after successful confirmation.
              </p>
            </Step>
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <Smartphone className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              Delete in the mobile app
            </h2>
          </div>

          <div className="space-y-6">
            <Step number="1" title="Open Settings">
              <p>Open the CommuN app and go to <strong>Settings</strong>.</p>
            </Step>
            <Step number="2" title="Security & Password">
              <p>
                Tap <strong>Security &amp; Password</strong>, then choose <strong>Delete Account</strong> (where
                available for your role).
              </p>
            </Step>
            <Step number="3" title="Or use the website">
              <p>
                You can also sign in on the web and follow the website steps above, or open this page on your phone:{' '}
                <a
                  href="https://www.commun.in/delete-account"
                  className="font-semibold text-[var(--purple-primary)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.commun.in/delete-account
                </a>
              </p>
            </Step>
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              Delete by email
            </h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            <p>
              If you cannot use the in-app or website flow, email us from your registered address:
            </p>
            <p>
              <a
                className="font-semibold text-[var(--purple-primary)] hover:underline"
                href={`mailto:${contactEmail}?subject=Delete%20CommuN%20account`}
              >
                {contactEmail}
              </a>
            </p>
            <p>
              Include your full name, registered phone/email, and a clear request to delete your CommuN account. Email
              deletion requests are completed within <strong>30 days</strong>.
            </p>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">What gets deleted</h2>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-secondary)]">
            <li>Your profile, login credentials, wishlist, and notifications.</li>
            <li>Provider service listings and reviews on those listings (for provider accounts).</li>
            <li>
              Events and chat messages may remain in the community attributed to “Former member.”
            </li>
            <li>Self-serve deletion is immediate; email requests within 30 days.</li>
          </ul>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            More details are in our{' '}
            <Link to="/privacy-policy" className="font-semibold text-[var(--purple-primary)] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </Card>
      </section>
    </div>
  );
};

export default DeleteAccount;
