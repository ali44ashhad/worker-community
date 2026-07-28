import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Flag,
  BookOpen,
  Lightbulb,
  Sparkles,
  Users,
  Briefcase,
  Building2,
  Target,
  Heart,
} from 'lucide-react';
import CommunityCta from '../components/home/CommunityCta';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

const SectionHeading = ({ icon: Icon, children, subtitle, light = false }) => (
  <motion.div {...fadeUp} className="text-center mb-12">
    <div
      className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${
        light
          ? 'bg-white/15 text-white border border-white/20'
          : 'bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]'
      }`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <h2
      className={`text-3xl sm:text-4xl font-bold mb-3 ${
        light
          ? 'text-white'
          : 'bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-transparent'
      }`}
    >
      {children}
    </h2>
    {subtitle && (
      <p className={`text-lg max-w-2xl mx-auto ${light ? 'text-purple-100' : 'text-[var(--text-secondary)]'}`}>
        {subtitle}
      </p>
    )}
  </motion.div>
);

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

const About = () => {
  const audiences = [
    {
      icon: Users,
      title: 'For Residents',
      color: 'from-purple-500 to-fuchsia-500',
      body: 'A place to discover trusted local services, stay informed, and connect with the community.',
    },
    {
      icon: Briefcase,
      title: 'For Local Professionals & Home Businesses',
      color: 'from-pink-500 to-rose-500',
      body: 'An opportunity to become visible to the people who matter most—their neighbours.',
    },
    {
      icon: Building2,
      title: 'For RWAs',
      color: 'from-emerald-500 to-teal-500',
      body: 'A modern way to communicate with residents and keep the community informed.',
    },
  ];

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                India&apos;s First Neighbourhood Operating System
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-4 leading-[1.1]">
              About CommuN
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-6">
              Reimagining Neighbourhood Living
            </p>
            <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Neighbourhoods have always been at the heart of our lives. We believe they deserve a better
              digital experience—so we created CommuN.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <motion.div {...fadeUp} className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
              <p>
                Neighbourhoods have always been at the heart of our lives. They&apos;re where we build
                friendships, celebrate milestones, seek recommendations, support local businesses, and
                create a sense of belonging.
              </p>
              <p>
                Yet, despite living just a few doors apart, many of us remain disconnected from the
                people, services, and opportunities around us. Finding a trusted tutor often means asking
                on WhatsApp. Looking for a reliable plumber relies on referrals. Community announcements
                get buried in endless chats, and local talent often goes unnoticed.
              </p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                We believe neighbourhoods deserve a better digital experience. That&apos;s why we created
                CommuN.
              </p>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* What is CommuN */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading icon={Sparkles} subtitle="India's first Neighbourhood Operating System (N.O.S.)">
            What is CommuN?
          </SectionHeading>
          <Card>
            <motion.div {...fadeUp} className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
              <p>
                CommuN is India&apos;s first Neighbourhood Operating System (N.O.S.)—a trusted digital
                platform designed to bring every aspect of neighbourhood life together in one place.
              </p>
              <p>
                Whether it&apos;s discovering trusted local services, connecting with neighbours who share
                your interests, staying informed through community announcements, participating in local
                events, or accessing essential neighbourhood information, CommuN makes everyday
                neighbourhood living simpler, more connected, and more organised.
              </p>
              <p className="font-semibold text-[var(--text-primary)]">
                Rather than replacing the relationships that make communities special, CommuN strengthens
                them by making it easier for neighbours to discover, connect, and support one another.
              </p>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Why We Built CommuN */}
      <section className="py-24 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading icon={Lightbulb} subtitle="The challenge isn't talent—it's discoverability">
            Why We Built CommuN
          </SectionHeading>
          <Card>
            <motion.div {...fadeUp} className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
              <p>Every neighbourhood already has incredible people.</p>
              <ul className="space-y-2">
                <CheckBullet>The tutor helping students succeed</CheckBullet>
                <CheckBullet>The home baker crafting amazing desserts</CheckBullet>
                <CheckBullet>The fitness coach inspiring healthier lifestyles</CheckBullet>
                <CheckBullet>
                  The architect, doctor, lawyer, artist, musician, entrepreneur, and countless others who
                  quietly contribute to the community every day
                </CheckBullet>
              </ul>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                The challenge isn&apos;t the lack of talent. It&apos;s discoverability.
              </p>
              <p>
                Many neighbourhood services remain hidden behind word-of-mouth recommendations and
                scattered conversations. Important updates are spread across multiple channels, making it
                difficult for residents to stay informed and engaged.
              </p>
              <p>
                CommuN brings these everyday neighbourhood interactions into one trusted platform—making
                local opportunities easier to discover and community life easier to navigate.
              </p>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Built Around Needs */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading icon={Users} subtitle="Designed to serve everyone who contributes to neighbourhood life">
            Built Around the Needs of Every Neighbourhood
          </SectionHeading>
          <div className="grid gap-8 md:grid-cols-3">
            {audiences.map(({ icon: Icon, title, color, body }, i) => (
              <motion.div key={title} {...fadeUp} transition={{ delay: i * 0.05 }}>
                <Card className="h-full hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all group">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.p
            {...fadeUp}
            className="mt-10 text-center text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto"
          >
            Together, they create a stronger, more connected neighbourhood ecosystem.
          </motion.p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gradient-to-br from-[var(--purple-primary)] via-[var(--purple-secondary)] to-[var(--purple-primary)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(217,70,239,0.2),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              {...fadeUp}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-6 py-10 sm:px-8"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
                <Flag className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-purple-50 leading-relaxed text-lg">
                To create the world&apos;s most connected neighbourhood ecosystem where residents, local
                businesses, and communities discover, connect, and thrive together.
              </p>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-6 py-10 sm:px-8"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-purple-50 leading-relaxed text-lg">
                To digitally empower neighbourhoods by making local communities more connected,
                discoverable, and organised through one trusted platform.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* More Than an App */}
      <section className="py-24 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading icon={Heart} subtitle="The digital foundation for neighbourhood life">
            More Than an App
          </SectionHeading>
          <Card>
            <motion.div {...fadeUp} className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
              <p>
                We don&apos;t see CommuN as just another app. We see it as the digital foundation for
                neighbourhood life—a platform that helps residents connect more easily, supports local
                entrepreneurs, strengthens communities, and makes everyday interactions more meaningful.
              </p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                Because when neighbourhoods become more connected, everyone benefits.
              </p>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Welcome CTA */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <Card className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="mb-4 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-transparent">
                Welcome to CommuN
              </h2>
              <p className="mx-auto mb-4 max-w-2xl text-[var(--text-secondary)] leading-relaxed">
                Whether you&apos;re looking for a trusted service, growing a local business, participating
                in your community, or simply staying connected with your neighbourhood, CommuN is built
                for you.
              </p>
              <p className="mx-auto mb-2 max-w-2xl text-[var(--text-secondary)] leading-relaxed">
                Because we believe every neighbourhood already has everything it needs. It just needs a
                better way to connect.
              </p>
              <p className="mb-8 text-xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-transparent sm:text-2xl">
                Stronger neighbourhoods build stronger communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/service"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transition-all font-semibold"
                >
                  Browse Services
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/category"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-200 text-[var(--purple-primary)] rounded-2xl hover:bg-purple-50 hover:border-[var(--purple-primary)] transition-all font-semibold"
                >
                  View Categories
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <CommunityCta />
    </motion.div>
  );
};

export default About;
