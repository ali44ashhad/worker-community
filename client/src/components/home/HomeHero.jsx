import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Calculator, BookOpen, ChefHat, Dumbbell } from 'lucide-react';

const floatingServices = [
  { icon: Calculator, label: 'C.A', top: '15%', left: '20%', delay: 0, color: 'from-blue-500 to-cyan-500' },
  { icon: BookOpen, label: 'Tutor', top: '25%', left: '70%', delay: 0.2, color: 'from-purple-500 to-pink-500' },
  { icon: ChefHat, label: 'Baker', top: '65%', left: '15%', delay: 0.4, color: 'from-emerald-500 to-teal-500' },
  { icon: Dumbbell, label: 'Pilates', top: '70%', left: '75%', delay: 0.6, color: 'from-rose-500 to-pink-500' },
];

const HomeHero = () => (
  <section className="relative overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-28 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,70,239,0.05),transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(107,70,193,0.05),transparent_50%)]" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        > 

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-6 leading-[1.1]">
            Your Locality.
            <br />
            Your People.
            <br />
            Your Platform.
          </h1>

          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl leading-relaxed">
            Connect with trusted local service providers in your neighborhood. From home repairs to tutoring,
            find the help you need, right where you live.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/service"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transition-all font-semibold"
            >
              Find Services
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/become-provider"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-200 text-[var(--purple-primary)] rounded-2xl hover:bg-purple-50 hover:border-[var(--purple-primary)] transition-all font-semibold"
            >
              Become a Provider
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-3xl opacity-20 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl shadow-purple-500/10 border border-purple-100/50">
            <div className="w-full aspect-square bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-purple-400" />
                  ))}
                </div>
              </div>

              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full blur-xl opacity-60" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] rounded-full flex items-center justify-center shadow-xl">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>

              {floatingServices.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    className="absolute bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/50"
                    style={{ top: item.top, left: item.left }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: item.delay }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HomeHero;
