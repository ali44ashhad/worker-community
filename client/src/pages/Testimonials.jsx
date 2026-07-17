import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, Quote, Star, Users, Heart, Briefcase } from 'lucide-react';

const getSecondaryCta = (user) => {
  if (!user) {
    return { to: '/login', label: 'Login to become a Provider' };
  }

  switch (user.role) {
    case 'provider':
      return { to: '/provider/dashboard', label: 'Go to Dashboard' };
    case 'secretary':
      return { to: '/secretary/dashboard', label: 'Go to Dashboard' };
    case 'admin':
      return { to: '/admin/dashboard', label: 'Go to Dashboard' };
    case 'customer':
    default:
      return { to: '/become-provider', label: 'Become a Provider' };
  }
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

const stats = [
  { label: 'Happy neighbours', value: '2,500+', icon: Users },
  { label: 'Local providers', value: '800+', icon: Briefcase },
  { label: 'Average rating', value: '4.8', icon: Star },
  { label: 'Communities', value: '120+', icon: Heart },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Resident & parent',
    locality: 'Green Valley Society',
    type: 'seeker',
    rating: 5,
    quote:
      'I found a maths tutor for my daughter two blocks away — someone we actually know in the community. No more scrolling through citywide listings. CommuN made it feel safe and local.',
  },
  {
    name: 'Rahul Mehta',
    role: 'Home baker',
    locality: 'Lakeview Apartments',
    type: 'provider',
    rating: 5,
    quote:
      'I started selling custom cakes to neighbours through CommuN. Orders come from people in my own society, word spreads naturally, and I keep every rupee — no platform commission.',
  },
  {
    name: 'Ananya Reddy',
    role: 'Fitness coach',
    locality: 'Sunrise Enclave',
    type: 'provider',
    rating: 5,
    quote:
      'My yoga and strength sessions are fully booked by residents who walk past my building every day. The trust factor of being a verified neighbour provider is unbeatable.',
  },
  {
    name: 'Vikram Joshi',
    role: 'Working professional',
    locality: 'Palm Grove Colony',
    type: 'seeker',
    rating: 5,
    quote:
      'Needed a plumber on short notice. Within an hour I had three options from my own colony with real reviews from people I trust. That kind of speed only works when it is hyperlocal.',
  },
  {
    name: 'Meera Iyer',
    role: 'Music teacher',
    locality: 'Heritage Heights',
    type: 'provider',
    rating: 4,
    quote:
      'Teaching piano to kids in my society has become my main income stream. Parents appreciate knowing exactly who is coming home, and I love building long-term relationships nearby.',
  },
  {
    name: 'Arjun Patel',
    role: 'New resident',
    locality: 'Cedar Park',
    type: 'seeker',
    rating: 5,
    quote:
      'We moved in last year and CommuN helped us feel at home fast — from home-cooked tiffin to a handyman for setup. It is like having a trusted directory of your own people.',
  },
];

const featured = testimonials.slice(0, 2);

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-amber-400 text-amber-400' : 'fill-purple-100 text-purple-100'
        }`}
      />
    ))}
  </div>
);

const TestimonialCard = ({ item, featured: isFeatured = false }) => (
  <motion.article
    {...fadeUp}
    className={`relative flex h-full flex-col rounded-3xl border border-purple-100/50 bg-white/80 p-6 shadow-lg shadow-purple-500/5 backdrop-blur-sm sm:p-8 ${
      isFeatured ? 'lg:p-10' : ''
    }`}
  >
    <Quote
      className={`mb-4 text-[var(--purple-primary)]/30 ${isFeatured ? 'h-10 w-10' : 'h-8 w-8'}`}
      aria-hidden
    />
    <p
      className={`flex-1 leading-relaxed text-[var(--text-secondary)] ${
        isFeatured ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
      }`}
    >
      &ldquo;{item.quote}&rdquo;
    </p>
    <div className="mt-6 flex items-center gap-4 border-t border-purple-100/60 pt-6">
      <div
        className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] font-semibold text-white ${
          isFeatured ? 'h-14 w-14 text-lg' : 'h-12 w-12 text-sm'
        }`}
      >
        {getInitials(item.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[var(--text-primary)]">{item.name}</p>
        <p className="truncate text-sm text-[var(--text-secondary)]">{item.role}</p>
        <p className="truncate text-xs text-[var(--purple-primary)]">{item.locality}</p>
      </div>
      <StarRating rating={item.rating} />
    </div>
    <span
      className={`absolute right-6 top-6 rounded-full px-3 py-1 text-xs font-semibold ${
        item.type === 'provider'
          ? 'bg-fuchsia-100 text-[var(--magenta)]'
          : 'bg-purple-100 text-[var(--purple-primary)]'
      }`}
    >
      {item.type === 'provider' ? 'Provider' : 'Seeker'}
    </span>
  </motion.article>
);

const Testimonials = () => {
  const user = useSelector((state) => state.auth.user);
  const secondaryCta = useMemo(() => getSecondaryCta(user), [user]);

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

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-block rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-4 py-2">
            <span className="bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-sm font-semibold text-transparent">
              Community Stories
            </span>
          </div>
          <h1 className="mb-6 bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-4xl font-bold leading-[1.1] text-transparent sm:text-5xl lg:text-6xl">
            What Our Neighbours Say
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            Real stories from residents and providers who found trust, convenience, and connection right
            in their own locality through CommuN.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Stats */}
    <section className="border-y border-purple-100/50 bg-white/60 py-12 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              {...fadeUp}
              className="text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </section>

    {/* Featured */}
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <h2 className="mb-3 bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Featured Stories
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            Hear from neighbours who turned local connections into everyday solutions.
          </p>
        </motion.div>
        <div className="grid gap-8 lg:grid-cols-2">
          {featured.map((item) => (
            <TestimonialCard key={item.name} item={item} featured />
          ))}
        </div>
      </div>
    </section>

    {/* All testimonials grid */}
    <section className="bg-gradient-to-b from-white to-purple-50/30 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <h2 className="mb-3 bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            More From the Community
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            Seekers and providers sharing how hyperlocal trust changed the way they live and work.
          </p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.name} item={item} />
          ))}
        </div>
      </div>
    </section>

    {/* Mid-page CTA */}
    <section className="pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-3xl rounded-3xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-lg shadow-purple-500/5 backdrop-blur-sm sm:p-12"
        >
          <h2 className="mb-4 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Ready to Write Your Story?
          </h2>
          <p className="mb-8 leading-relaxed text-[var(--text-secondary)]">
            Whether you need a trusted local service or want to offer your skills to neighbours,
            CommuN is built for your community.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/service"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-8 py-4 font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
            >
              Find Services
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to={secondaryCta.to}
              className="inline-flex items-center justify-center rounded-2xl border-2 border-purple-200 px-8 py-4 font-semibold text-[var(--purple-primary)] transition-all hover:border-[var(--purple-primary)] hover:bg-purple-50"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </motion.div>
      </div>
    </section> 
  </motion.div>
  );
};

export default Testimonials;
