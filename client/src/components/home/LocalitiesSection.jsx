import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const comingSoonLocalities = [
  { name: 'Hauz Khas', top: '30%', left: '25%' },
  { name: 'Greater Kailash', top: '40%', left: '60%' },
  { name: 'Vasant Kunj', top: '68%', left: '28%' },
  { name: 'Saket', top: '62%', left: '55%' },
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

      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 overflow-hidden shadow-2xl">
        <div className="relative h-96 bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
          <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
            <defs>
              <pattern id="home-locality-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#home-locality-grid)" />
            <path d="M 0 150 Q 200 180 400 150 T 800 150" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M 200 0 L 200 400" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M 0 250 L 800 250" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M 400 0 L 400 400" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M 600 0 L 600 400" stroke="white" strokeWidth="2.5" fill="none" opacity="0.4" />
          </svg>

          <motion.div
            className="absolute"
            style={{ top: '45%', left: '38%', width: '140px', height: '140px' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <svg width="140" height="140" className="absolute inset-0" aria-hidden="true">
              <path
                d="M 20 10 Q 70 5 120 15 L 135 60 Q 130 110 100 130 L 40 135 Q 10 110 15 60 Z"
                fill="rgba(217,70,239,0.35)"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs border border-white/30 font-medium">
                  Sainik Farms
                  <div className="text-xs text-fuchsia-200 mt-0.5 flex items-center justify-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 bg-fuchsia-300 rounded-full animate-pulse" />
                    Active Now
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {comingSoonLocalities.map((locality, i) => (
            <motion.div
              key={locality.name}
              className="absolute"
              style={{ top: locality.top, left: locality.left }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-8 h-8 bg-purple-300/30 rounded-full flex items-center justify-center border-2 border-purple-300/40">
                <MapPin className="w-4 h-4 text-purple-200" />
              </div>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-white/10 backdrop-blur-sm text-purple-100 px-3 py-1.5 rounded-xl text-xs border border-white/20 font-medium">
                  {locality.name}
                  <div className="text-xs text-purple-200 mt-0.5">Coming Soon</div>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
            <div className="text-sm text-white space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full" />
                <span>Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-300/30 rounded-full border border-purple-300/40" />
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
