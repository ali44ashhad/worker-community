import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineFlag,
  HiOutlineBookOpen,
  HiOutlineLightBulb,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineLightningBolt,
} from 'react-icons/hi';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

const SectionLabel = ({ icon: Icon, children }) => (
  <motion.div {...fadeUp} className="mb-8 flex items-center gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
      <Icon className="h-5 w-5" />
    </span>
    <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{children}</h2>
  </motion.div>
);

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 ${className}`}>
    {children}
  </div>
);

const Bullet = ({ children }) => (
  <li className="flex gap-3 text-gray-600 leading-relaxed">
    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
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
      icon: HiOutlineUsers,
      title: 'For Residents',
      items: [
        'Find trusted services offered by neighbours',
        'Avoid citywide clutter & irrelevant search results',
        'Support local talent and build real Community connections',
      ],
    },
    {
      icon: HiOutlineBriefcase,
      title: 'For Service Providers',
      items: [
        'Get visibility within your own colony',
        'Build a trusted audience right where you live',
        'Grow home-based businesses without marketing spend',
      ],
    },
    {
      icon: HiOutlineLightningBolt,
      title: 'For the Future',
      items: [
        'Secure in-app payments',
        'RWA management tools',
        'Announcements, payrolls, visitor logs, events & more',
      ],
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-28"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Hero */}
        <header className="mb-12 text-center sm:mb-14">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Our mission
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            About{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Commun
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
            A hyperlocal platform that helps residents discover trusted neighbourhood services
            and gives home-based providers the visibility they deserve.
          </p>
        </header>

        {/* Intro */}
        <Card className="mb-10">
          <motion.div {...fadeUp} className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Every neighbourhood is rich with talent, services, and people who can support one
              another — but most of this remains unseen. Someone runs fitness classes at home,
              someone sells home-cooked products, someone offers tuitions, workshops, repairs, or
              professional services… yet most residents never know about them.
            </p>
            <p className="text-lg font-semibold text-gray-900">
              Commun was created to bring all of this to light.
            </p>
            <p>
              Commun helps residents discover trusted services within their neighbourhood and
              enables those who offer skills or home-based products to become visible to fellow
              neighbours. Built for independent colonies and Community clusters, Commun makes
              discovery easy, communication seamless, and opportunities accessible to everyone.
            </p>
            <p className="text-sm font-medium text-indigo-600">And this is only the beginning.</p>
          </motion.div>
        </Card>

        {/* Purpose — compact highlight */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel icon={HiOutlineFlag}>
            Our <span className="text-indigo-600">Purpose</span>
          </SectionLabel>
          <motion.div
            {...fadeUp}
            className="rounded-2xl border border-gray-200 bg-gray-900 px-6 py-8 text-center text-white sm:px-10"
          >
            <p className="text-lg font-semibold leading-snug sm:text-xl md:text-2xl">
              To make neighbourhood living more connected, convenient, and Community-driven.
            </p>
          </motion.div>
        </motion.div>

        {/* Story */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel icon={HiOutlineBookOpen}>
            Our <span className="text-indigo-600">Story</span>
          </SectionLabel>
          <Card>
            <motion.div {...fadeUp} className="space-y-4 text-gray-600 leading-relaxed">
              <p>Commun began with a simple observation:</p>
              <p>
                Despite living just a few steps apart, neighbours often remain disconnected from
                the skills, services, and support systems that exist right around them.
              </p>
              <p>
                Independent colonies — unlike gated Communities — lack a unified platform where
                residents can communicate, offer services, or discover what others provide. People
                end up searching the entire internet for services that may be available right next
                door. This gap inspired the creation of Commun.
              </p>
              <p className="font-semibold text-gray-900">We imagined a platform where:</p>
              <ul className="space-y-2">
                <Bullet>Residents could list what they offer</Bullet>
                <Bullet>Neighbours could find trusted help easily</Bullet>
                <Bullet>Communities could strengthen their internal networks</Bullet>
              </ul>
              <p>
                What started as an idea for resident-to-resident discovery evolved into a broader
                vision:{' '}
                <span className="font-semibold text-gray-900">
                  to create India&apos;s most connected neighbourhood ecosystem.
                </span>
              </p>
              <p>
                Commun is built on the belief that stronger neighbourhoods create better everyday
                living — and technology can make this happen effortlessly.
              </p>
            </motion.div>
          </Card>
        </motion.div>

        {/* Problems */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel icon={HiOutlineLightBulb}>
            The <span className="text-indigo-600">Problem</span> We&apos;re Solving
          </SectionLabel>
          <motion.div
            {...fadeUp}
            className="grid gap-4 sm:grid-cols-2"
          >
            {problems.map((item, i) => (
              <Card key={item.title} className="flex flex-col">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-900">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
                  {item.title}
                </h3>
                {item.body && <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>}
                {item.bullets && (
                  <ul className="mt-2 space-y-2">
                    {item.bullets.map((b) => (
                      <Bullet key={b}>{b}</Bullet>
                    ))}
                  </ul>
                )}
                {item.footnote && (
                  <p className="mt-3 text-sm font-semibold text-gray-900">{item.footnote}</p>
                )}
              </Card>
            ))}
          </motion.div>
          <motion.p
            {...fadeUp}
            className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/80 px-5 py-4 text-center text-sm font-medium text-gray-800 sm:text-base"
          >
            Commun solves all of these with one platform that keeps the neighbourhood at its
            center.
          </motion.p>
        </motion.div>

        {/* Why Commun */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel icon={HiOutlineSparkles}>
            Why <span className="text-indigo-600">Commun</span> Matters
          </SectionLabel>
          <motion.div
            {...fadeUp}
            className="grid gap-4 md:grid-cols-3"
          >
            {audiences.map(({ icon: Icon, title, items }) => (
              <Card key={title} className="flex flex-col">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mb-3 text-lg font-bold text-gray-900">{title}</h3>
                <ul className="space-y-2">
                  {items.map((text) => (
                    <Bullet key={text}>{text}</Bullet>
                  ))}
                </ul>
              </Card>
            ))}
          </motion.div>
          <motion.p
            {...fadeUp}
            className="mt-6 text-center text-gray-600 leading-relaxed"
          >
            Commun is built to become{' '}
            <span className="font-semibold text-gray-900">
              the digital backbone of every neighbourhood
            </span>{' '}
            — simple, safe, and truly Community-first.
          </motion.p>
        </motion.div>

        {/* Value statement */}
        <motion.div {...fadeUp} className="mb-10">
          <Card className="border-gray-300 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <p className="text-center text-base leading-relaxed text-gray-200 sm:text-lg">
              Commun operates at the intersection of{' '}
              <span className="font-semibold text-white">
                Community, convenience, and hyperlocal commerce
              </span>
              , aiming to become the default digital layer for neighbourhoods across India. By
              empowering residents and enabling micro-entrepreneurs, Commun unlocks a scalable
              ecosystem with long-term network effects.
            </p>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp}>
          <Card className="text-center">
            <p className="mx-auto mb-4 max-w-xl text-gray-600 leading-relaxed">
              Whether you&apos;re seeking help, offering your skills, or managing a colony, Commun
              is here to strengthen the bond between people and the places they call home.
            </p>
            <p className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
              Connect. Discover. Thrive Local — with Commun.
            </p>
            <motion.div
              className="flex flex-col justify-center gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link
                to="/service"
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Browse Services
              </Link>
              <Link
                to="/category"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                View Categories
              </Link>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default About;
