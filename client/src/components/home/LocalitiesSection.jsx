import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const activeLocality = {
  name: 'Sainik Farms',
  className:
    'bottom-[20%] right-[6%] sm:bottom-[16%] sm:right-[12%] sm:top-auto sm:left-auto sm:translate-x-0 sm:translate-y-0 lg:bottom-auto lg:top-[62%] lg:right-auto lg:left-[55%]',
};

const comingSoonLocalities = [
  {
    name: 'Hauz Khas',
    className: 'top-[8%] right-[30%] sm:top-[22%] sm:left-[18%] lg:top-[22%] lg:left-[25%]',
  },
  {
    name: 'Greater Kailash',
    className: 'top-[18%] right-[2%] sm:top-[20%] sm:right-[14%] lg:top-[40%] lg:right-auto lg:left-[60%]',
  },
  // {
  //   name: 'Greater Kailash',
  //   className: 'top-[12%] right-[5%] sm:top-[20%] sm:right-[14%] lg:top-[40%] lg:right-auto lg:left-[60%]',
  // },
  {
    name: 'Vasant Kunj',
    className: 'bottom-[20%] left-[6%] sm:bottom-[18%] sm:left-[16%] lg:bottom-auto lg:top-[68%] lg:left-[28%]',
  },
  {
    name: 'Saket',
    className:
      'top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 sm:bottom-auto sm:top-[45%] sm:left-[38%] sm:right-auto sm:translate-x-0 sm:translate-y-0 lg:top-[48%] lg:left-[42%]',
  },
];

const LocalitiesSection = () => (
  <section id="localities" className="py-24 bg-gradient-to-br from-[var(--purple-primary)] via-[var(--purple-secondary)] to-[var(--purple-primary)] text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(217,70,239,0.2),transparent_70%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(107,70,193,0.2),transparent_70%)]" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Available in Delhi</h2>
        <p className="text-lg text-purple-100 max-w-2xl mx-auto">
          Starting with Sainik Farms. More localities coming soon.
        </p>
      </div>

      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-4 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative min-h-[26rem] sm:min-h-[24rem] h-[62vw] max-h-[30rem] sm:h-96 bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
          {/* Full-height grid — CSS so it always covers the entire map */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.45) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.45) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
            }}
          />

          {/* Decorative map lines */}
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 0 38 Q 25 42 50 38 T 100 38" stroke="white" strokeWidth="0.4" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M 25 0 L 25 100" stroke="white" strokeWidth="0.35" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M 0 62 L 100 62" stroke="white" strokeWidth="0.35" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M 50 0 L 50 100" stroke="white" strokeWidth="0.35" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M 75 0 L 75 100" stroke="white" strokeWidth="0.45" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* Active locality */}
          <motion.div
            className={`absolute z-10 ${activeLocality.className}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center w-[5.5rem] h-[4.75rem] sm:w-[6.25rem] sm:h-[5.25rem]">
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="30"
                    ry="27"
                    fill="rgba(217,70,239,0.35)"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.5"
                  />
                </svg>
                <div className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                  <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                </div>
              </div>
              <div className="mt-0.5 max-w-[9.5rem] sm:max-w-none">
                <div className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs border border-white/30 font-medium text-center">
                  {activeLocality.name}
                  <div className="text-[10px] sm:text-xs text-fuchsia-200 mt-0.5 flex items-center justify-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 bg-fuchsia-300 rounded-full animate-pulse shrink-0" />
                    Active Now
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {comingSoonLocalities.map((locality, i) => (
            <motion.div
              key={locality.name}
              className={`absolute z-10 ${locality.className}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-300/30 rounded-full flex items-center justify-center border-2 border-purple-300/40 shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200" />
                </div>
                <div className="mt-1.5 max-w-[6.5rem] sm:max-w-[7.5rem]">
                  <div className="bg-white/10 backdrop-blur-sm text-purple-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs border border-white/20 font-medium text-center leading-tight">
                    {locality.name}
                    <div className="text-[9px] sm:text-xs text-purple-200 mt-0.5">Coming Soon</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4 sm:left-4 sm:translate-x-0 bg-white/10 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border border-white/20">
            <div className="flex flex-row sm:flex-col items-center sm:items-start gap-5 sm:gap-0 sm:space-y-3 text-xs sm:text-sm text-white font-medium">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full shrink-0" />
                <span>Active</span>
              </div>
              <div className="hidden sm:block w-full h-px bg-white/15" aria-hidden="true" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-300/30 rounded-full border border-purple-300/40 shrink-0" />
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-purple-100 mb-5 text-lg font-medium">Want CommuN in your locality?</p>
          <Link
            to="/contact"
            className="inline-flex px-8 py-4 bg-white text-[var(--purple-primary)] rounded-2xl hover:bg-purple-50 hover:scale-105 transition-all font-bold shadow-lg"
          >
            Request Your Area
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default LocalitiesSection;
