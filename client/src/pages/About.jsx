import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Flag, BookOpen, Lightbulb, Sparkles, Users, Briefcase, Zap } from 'lucide-react';
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
        light ? 'text-white' : 'bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-transparent'
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
  const problems = [
    {
      title: "Residents don't know what services exist within their own colony",
      body: 'There is no structured way to discover tutors, fitness coaches, hobby experts, home bakers, freelancers, and more — even when they live in the same block.',
    },
    {
      title: 'Home-based service providers have no visibility',
      body: 'Talented residents struggle to reach their immediate neighbourhood audience, forcing them to depend on citywide listings or word of mouth.',
    },
    {
      title: "Existing platforms aren't hyperlocal",
      body: null,
      bullets: [
        'Justdial, Nearbuy show citywide vendors, not neighbours',
        'MyGate caters mainly to gated societies',
        'IamHere is radius-based, not colony-based',
      ],
      footnote: 'None of them solve the "my colony, my Community" gap.',
    },
    {
      title: 'No platform strengthens neighbourhood trust & collaboration',
      body: 'Communities thrive when people know and support each other — but there has never been a digital tool designed for this.',
    },
  ];

  const audiences = [
    {
      icon: Users,
      title: 'For Residents',
      color: 'from-purple-500 to-fuchsia-500',
      items: [
        'Find trusted services offered by neighbours',
        'Avoid citywide clutter & irrelevant search results',
        'Support local talent and build real Community connections',
      ],
    },
    {
      icon: Briefcase,
      title: 'For Service Providers',
      color: 'from-pink-500 to-rose-500',
      items: [
        'Get visibility within your own colony',
        'Build a trusted audience right where you live',
        'Grow home-based businesses without marketing spend',
      ],
    },
    {
      icon: Zap,
      title: 'For the Future',
      color: 'from-emerald-500 to-teal-500',
      items: [
        'Secure in-app payments',
        'RWA management tools',
        'Announcements, payrolls, visitor logs, events & more',
      ],
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
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
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
                Our Mission
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-6 leading-[1.1]">
              About CommuN
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              A hyperlocal platform that helps residents discover trusted neighbourhood services
              and gives home-based providers the visibility they deserve.
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
                Every neighbourhood is rich with talent, services, and people who can support one
                another — but most of this remains unseen. Someone runs fitness classes at home,
                someone sells home-cooked products, someone offers tuitions, workshops, repairs, or
                professional services… yet most residents never know about them.
              </p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                CommuN was created to bring all of this to light.
              </p>
              <p>
                CommuN helps residents discover trusted services within their neighbourhood and
                enables those who offer skills or home-based products to become visible to fellow
                neighbours. Built for independent colonies and Community clusters, CommuN makes
                discovery easy, communication seamless, and opportunities accessible to everyone.
              </p>
              <p className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                And this is only the beginning.
              </p>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-16 bg-gradient-to-br from-[var(--purple-primary)] via-[var(--purple-secondary)] to-[var(--purple-primary)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(217,70,239,0.2),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeading icon={Flag} subtitle="What drives everything we build" light>
            Our Purpose
          </SectionHeading>
          <motion.div
            {...fadeUp}
            className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-6 py-10 sm:px-12"
          >
            <p className="text-xl sm:text-2xl font-semibold leading-snug text-purple-50">
              To make neighbourhood living more connected, convenient, and Community-driven.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading icon={BookOpen} subtitle="How CommuN came to be">
            Our Story
          </SectionHeading>
          <Card>
            <motion.div {...fadeUp} className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
              <p>CommuN began with a simple observation:</p>
              <p>
                Despite living just a few steps apart, neighbours often remain disconnected from
                the skills, services, and support systems that exist right around them.
              </p>
              <p>
                Independent colonies — unlike gated Communities — lack a unified platform where
                residents can communicate, offer services, or discover what others provide. People
                end up searching the entire internet for services that may be available right next
                door. This gap inspired the creation of CommuN.
              </p>
              <p className="font-semibold text-[var(--text-primary)]">We imagined a platform where:</p>
              <ul className="space-y-2">
                <CheckBullet>Residents could list what they offer</CheckBullet>
                <CheckBullet>Neighbours could find trusted help easily</CheckBullet>
                <CheckBullet>Communities could strengthen their internal networks</CheckBullet>
              </ul>
              <p>
                What started as an idea for resident-to-resident discovery evolved into a broader
                vision:{' '}
                <span className="font-semibold text-[var(--text-primary)]">
                  to create India&apos;s most connected neighbourhood ecosystem.
                </span>
              </p>
              <p>
                CommuN is built on the belief that stronger neighbourhoods create better everyday
                living — and technology can make this happen effortlessly.
              </p>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Problems */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading icon={Lightbulb} subtitle="The gap we set out to close">
            The Problem We&apos;re Solving
          </SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2">
            {problems.map((item, i) => (
              <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.05 }}>
                <Card className="h-full hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
                  <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] text-sm font-bold text-white shadow-lg">
                    {i + 1}
                  </span>
                  <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">{item.title}</h3>
                  {item.body && (
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.body}</p>
                  )}
                  {item.bullets && (
                    <ul className="mt-3 space-y-2">
                      {item.bullets.map((b) => (
                        <CheckBullet key={b}>{b}</CheckBullet>
                      ))}
                    </ul>
                  )}
                  {item.footnote && (
                    <p className="mt-4 text-sm font-semibold text-[var(--purple-primary)]">{item.footnote}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.p
            {...fadeUp}
            className="mt-10 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-fuchsia-50 px-6 py-5 text-center text-base font-medium text-[var(--text-primary)]"
          > 
            CommuN solves all of these with one platform that keeps the neighbourhood at its center.
          </motion.p>
        </div>
      </section>

      {/* Why CommuN */}
      <section className=" bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading icon={Sparkles} subtitle="Built for neighbours, by neighbours">
            Why CommuN Matters
          </SectionHeading>
          <div className="grid gap-8 md:grid-cols-3">
            {audiences.map(({ icon: Icon, title, color, items }, i) => (
              <motion.div key={title} {...fadeUp} transition={{ delay: i * 0.05 }}>
                <Card className="h-full hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all group">
                  <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-[var(--text-primary)]">{title}</h3>
                  <ul className="space-y-3">
                    {items.map((text) => (
                      <CheckBullet key={text}>{text}</CheckBullet>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.p {...fadeUp} className="mt-10 text-center text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            CommuN is built to become{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              the digital backbone of every neighbourhood
            </span>{' '}
            — simple, safe, and truly Community-first.
          </motion.p>
        </div>
      </section>

      {/* Value statement */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--purple-primary)] via-[var(--magenta)] to-fuchsia-600 p-8 sm:p-12 text-center text-white shadow-2xl shadow-purple-500/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            <p className="relative text-base leading-relaxed text-purple-50 sm:text-lg max-w-3xl mx-auto">
              CommuN operates at the intersection of{' '}
              <span className="font-semibold text-white">
                Community, convenience, and hyperlocal commerce
              </span>
              , aiming to become the default digital layer for neighbourhoods across India. By
              empowering residents and enabling micro-entrepreneurs, CommuN unlocks a scalable
              ecosystem with long-term network effects.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Inline CTA before footer CTA */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <Card className="text-center">
              <p className="mx-auto mb-4 max-w-xl text-[var(--text-secondary)] leading-relaxed">
                Whether you&apos;re seeking help, offering your skills, or managing a colony, CommuN
                is here to strengthen the bond between people and the places they call home.
              </p>
              <p className="mb-8 text-xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-transparent sm:text-2xl">
                Connect. Discover. Thrive Local — with CommuN.
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