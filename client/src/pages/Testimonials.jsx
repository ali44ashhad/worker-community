import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, Quote, Star } from 'lucide-react';

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

const testimonials = [
  {
    name: 'Anshu Kapoor',
    role: 'Resident',
    type: 'seeker',
    rating: 5,
    quote:
      "I've been living in Sainik Farm for years, yet I was amazed to discover so many local businesses I never knew existed right in my own neighbourhood! I was struggling to find someone for my kids' outfits for a family function, and through CommuN, I found a lovely boutique that was exactly what I needed.\nI also discovered excellent tuition teachers and learning centres nearby. Best of all, it has significantly reduced the need to repeatedly ask the same questions on WhatsApp groups. CommuN has made discovering trusted neighbourhood services so easy and convenient!",
  },
  {
    name: 'Radhika Malhotra',
    role: 'Resident',
    type: 'seeker',
    rating: 5,
    quote:
      "I no longer have to keep asking the same questions on WhatsApp. Whether it's finding a tutor or a reliable electrician, everything is much easier to discover on CommuN. Simple, clean and actually useful. I find myself opening CommuN whenever I need something within the neighbourhood.",
  },
  {
    name: 'Swati Rekhi',
    role: 'Resident',
    type: 'seeker',
    rating: 5,
    quote:
      "It's surprising how many talented people live around us. Through CommuN, I found a fellow resident who dishes out amazing salads just a few streets away. Prior to using CommuN I had no idea who in my neighbourhood offers what but now all this information is easily accessible to me at all times.",
  },
  {
    name: 'Shaloo Makhija',
    role: 'Boutique Owner',
    type: 'provider',
    rating: 5,
    quote:
      'Most of my work comes from people living nearby. CommuN helps me reach exactly the audience I want. Instead of posting repeatedly on WhatsApp groups, my profile is always available for residents to discover whenever they need my services.',
  },
  {
    name: 'Tanvi Saraf',
    role: 'Resident',
    type: 'seeker',
    rating: 5,
    quote:
      "The first time I used CommuN was because I needed a cake at the absolute last minute. I was convinced I'd have to order from a bakery across town. Turns out, there was someone literally in my own neighbourhood making gorgeous cakes. 😂 That's when it hit me! We're all constantly asking, \"Does anyone know someone who...?\" and half the time, that someone lives five minutes away. Such a ridiculously simple idea, but I genuinely love it.",
  },
  {
    name: 'Anushree Mahajan',
    role: 'Carltons Bistro',
    type: 'provider',
    rating: 5,
    quote:
      'Rakita is very enterprising young lady and her idea to create a common platform where everyone can Meet, Share and Enjoy brings the entire community together. \nFriendships foster and creativity develops as collaborative efforts are the key to every success and not isolation. \nWish you all the best in your endeavours.',
  },
  {
    name: 'Karishma Jain',
    role: 'Story Teller',
    type: 'provider',
    rating: 5,
    quote:
      'Being an avid reader and an English fanatic, I have always aspired to engage in storytelling for kids.\nConducting English reading and storytelling classes for kids from home, CommuN has been a tremendous help and a blessing for me. This hyper local community forum has enabled me to reach a wider spectrum of people in a short time. I highly recommend everyone to sign up and make your lives easier with CommuN.',
  },
  {
    name: 'Pragya Gupta',
    role: 'Festive Decor',
    type: 'provider',
    rating: 5,
    quote:
      'The ultimate local directory. It is incredible how much talent and knowledge exists right on our doorstep! \nI have connected with so many nearby residents who were looking for trusted local festive decor. But, it\'s not just about getting new clients; it\'s about building real relationships right here in our neighbourhood. It truly turns a neighbourhood into a supportive community. \nHighly recommend to anyone looking to support local pros or find quick, reliable answers.',
  },
];

const videoTestimonials = [
  {
    id: 'nmg8XYEJbms',
    title: 'CommuN neighbour story',
    url: 'https://www.youtube.com/shorts/nmg8XYEJbms',
  },
  {
    id: 't64TSw9WQWc',
    title: 'CommuN community story',
    url: 'https://www.youtube.com/shorts/t64TSw9WQWc',
  },
];

const featured = testimonials.slice(0, 2);
const moreTestimonials = testimonials.slice(2);

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
      className={`flex-1 whitespace-pre-line leading-relaxed text-[var(--text-secondary)] ${
        isFeatured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
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
      {item.type === 'provider' ? 'Provider' : 'Resident'}
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
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 pt-8 pb-16 lg:pt-10 lg:pb-20">
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

      {/* Video testimonials */}
      <section className="bg-gradient-to-b from-white to-purple-50/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="mb-3 bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Video Testimonials
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
              Watch neighbours share how CommuN helps them discover trusted local services.
            </p>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
            {videoTestimonials.map((video) => (
              <motion.div
                key={video.id}
                {...fadeUp}
                className="overflow-hidden rounded-3xl border border-purple-100/50 bg-white/80 shadow-lg shadow-purple-500/5 backdrop-blur-sm"
              >
                <div className="relative aspect-[9/16] w-full bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <div className="px-4 py-3 text-center">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--purple-primary)] hover:underline"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All testimonials grid */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="mb-3 bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              More From the Community
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
              Residents and providers sharing how hyperlocal trust changed the way they live and work.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {moreTestimonials.map((item) => (
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