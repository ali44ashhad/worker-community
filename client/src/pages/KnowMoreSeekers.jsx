import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, Search, ShieldCheck, BadgeCheck, Users } from 'lucide-react';
import { canBecomeProvider } from '../utils/userHelpers';
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

const Card = ({ children, className = '' }) => (
  <div
    className={`relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-6 sm:p-8 shadow-lg shadow-purple-500/5 ${className}`}
  >
    {children}
  </div>
);

const CheckBullet = ({ children }) => (
  <li className="flex items-start gap-3 text-[var(--text-secondary)] leading-relaxed">
    <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)]">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
    <span>{children}</span>
  </li>
);

const Feature = ({ icon: Icon, title, body }) => (
  <Card className="h-full hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)] flex items-center justify-center mb-5">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
    <p className="text-[var(--text-secondary)] leading-relaxed">{body}</p>
  </Card>
);

const KnowMoreSeekers = () => {
  const user = useSelector((state) => state.auth.user);
  const showBecomeProvider = canBecomeProvider(user);

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-10 lg:pb-20 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,70,239,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(107,70,193,0.05),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                Know More
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-6 leading-[1.1]">
              For Seekers
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Discover trusted services from people in and around your neighbourhood — faster than scrolling
              citywide listings and safer than random contacts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-transparent mb-3">
              Why CommuN Works for You
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              A neighbourhood-first marketplace that makes it easy to find the right help nearby.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div {...fadeUp}>
              <Feature
                icon={Search}
                title="Easy discovery"
                body="Browse services and categories with clean filters instead of endless scrolling."
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
              <Feature
                icon={Users}
                title="Hyperlocal focus"
                body="See providers around you — within your locality and nearby areas."
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Feature
                icon={BadgeCheck}
                title="Clear details"
                body="Profiles show service info, pricing, and what’s included so you can decide confidently."
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
              <Feature
                icon={ShieldCheck}
                title="Trust-first"
                body="Neighbourhood visibility and transparent profiles help you pick with peace of mind."
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to get started */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-2 items-start">
            <Card>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">How to get started</h3>
              <ul className="space-y-3">
                <CheckBullet>Explore services or categories</CheckBullet>
                <CheckBullet>Open a provider profile and review details</CheckBullet>
                <CheckBullet>Add favourites to your wishlist for later</CheckBullet>
                <CheckBullet>Connect and confirm the service details</CheckBullet>
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/service"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all font-semibold"
                >
                  Browse Services
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/category"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-purple-200 text-[var(--purple-primary)] rounded-2xl hover:bg-purple-50 hover:border-[var(--purple-primary)] transition-all font-semibold"
                >
                  View Categories
                </Link>
              </div>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Tips for better results</h3>
              <ul className="space-y-3">
                <CheckBullet>Compare a few providers before deciding</CheckBullet>
                <CheckBullet>Read the service description carefully</CheckBullet>
                <CheckBullet>Confirm pricing and timelines up front</CheckBullet>
                <CheckBullet>Save your favourites to revisit anytime</CheckBullet>
              </ul>
              {showBecomeProvider && (
                <>
                  <p className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                    Want to offer a skill too? You can join as a provider anytime.
                  </p>
                  <Link
                    to="/become-provider"
                    className="mt-4 inline-flex items-center justify-center px-6 py-3 border-2 border-purple-200 text-[var(--purple-primary)] rounded-2xl hover:bg-purple-50 hover:border-[var(--purple-primary)] transition-all font-semibold w-full sm:w-auto"
                  >
                    Become a Provider
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </section> 
    </motion.div>
  );
};

export default KnowMoreSeekers;

