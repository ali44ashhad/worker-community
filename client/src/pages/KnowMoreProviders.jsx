import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, Briefcase, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
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

const KnowMoreProviders = () => {
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
              For Providers
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Turn your skills into a trusted hyperlocal service. Build visibility in your own colony, grow through
              repeat customers, and become the go-to expert in your neighbourhood.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-transparent mb-3">
              What You Get
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Everything you need to start, showcase your work, and earn trust from neighbours.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div {...fadeUp}>
              <Feature
                icon={Sparkles}
                title="Profile that sells"
                body="Showcase your services, experience, photos, and pricing in a clean, professional profile."
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
              <Feature
                icon={TrendingUp}
                title="Local discovery"
                body="Get found by residents searching for services in your own locality and nearby areas."
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Feature
                icon={ShieldCheck}
                title="Trust signals"
                body="Build credibility with community visibility, clear service details, and transparent communication."
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
              <Feature
                icon={Briefcase}
                title="Simple management"
                body="Create and manage your services easily and keep everything updated from your dashboard."
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-2 items-start">
            <Card>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">How it works</h3>
              <ul className="space-y-3">
                <CheckBullet>Create your provider profile</CheckBullet>
                <CheckBullet>Add your services with clear descriptions and pricing</CheckBullet>
                <CheckBullet>Get discovered by local residents</CheckBullet>
                <CheckBullet>Deliver great service and grow through repeat customers</CheckBullet>
              </ul>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Provider best practices</h3>
              <ul className="space-y-3">
                <CheckBullet>Use real photos and specific service details</CheckBullet>
                <CheckBullet>Set clear timelines and what’s included</CheckBullet>
                <CheckBullet>Communicate politely and promptly</CheckBullet>
                <CheckBullet>Keep your availability and pricing updated</CheckBullet>
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {showBecomeProvider && (
                  <Link
                    to="/become-provider"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all font-semibold"
                  >
                    Become a Provider
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                )}
                <Link
                  to="/provider"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-purple-200 text-[var(--purple-primary)] rounded-2xl hover:bg-purple-50 hover:border-[var(--purple-primary)] transition-all font-semibold"
                >
                  Browse Providers
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section> 
    </motion.div>
  );
};

export default KnowMoreProviders;

