import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiBase } from '../../utils/apiBase';
import LocalitiesMap from './LocalitiesMap';

const FALLBACK_LOCALITIES = [
  { _id: 'fallback-1', name: 'Sainik Farms', status: 'active', x: 64, y: 70 },
  { _id: 'fallback-2', name: 'Anupam Gardens', status: 'active', x: 51, y: 70 },
  { _id: 'fallback-3', name: 'Hauz Khas', status: 'comingSoon', x: 25, y: 22 },
  { _id: 'fallback-4', name: 'Greater Kailash', status: 'comingSoon', x: 60, y: 40 },
  { _id: 'fallback-5', name: 'Vasant Kunj', status: 'comingSoon', x: 28, y: 68 },
  { _id: 'fallback-6', name: 'Saket', status: 'comingSoon', x: 42, y: 48 },
];

const LocalitiesSection = () => {
  const [localities, setLocalities] = useState(FALLBACK_LOCALITIES);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const apiBase = getApiBase() || '';
        const res = await fetch(`${apiBase}/api/localities`);
        const data = await res.json();
        if (!cancelled && res.ok && Array.isArray(data?.localities) && data.localities.length) {
          setLocalities(data.localities);
        }
      } catch {
        // keep fallback
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="localities"
      className="py-24 bg-gradient-to-br from-[var(--purple-primary)] via-[var(--purple-secondary)] to-[var(--purple-primary)] text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(219,88,159,0.2),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(104,67,154,0.2),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Available in Delhi</h2>
        </div>

        <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-4 sm:p-8 overflow-hidden shadow-2xl">
          <LocalitiesMap localities={localities} />

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
};

export default LocalitiesSection;
