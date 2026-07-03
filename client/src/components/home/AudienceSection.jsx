import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { canBecomeProvider } from '../../utils/userHelpers';

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const seekerBenefits = [
  'Verified local providers in your neighborhood',
  'Transparent pricing and honest reviews',
  'Direct communication, no middlemen',
  'Community-driven trust and ratings',
  'Quick response times from nearby providers',
  'Know more about Seekers',
];

const providerBenefits = [
  'Reach customers in your immediate area',
  'Build your reputation with real reviews',
  'No commission fees on bookings',
  'Simple profile setup and management',
  'Direct client relationships you control',
  'Know more about Providers',
];

const AudienceSection = () => {
  const user = useSelector((state) => state.auth.user);
  const showBecomeProvider = canBecomeProvider(user);

  return (
  <section className="grid lg:grid-cols-2">
    <div id="for-seekers" className="bg-gradient-to-br from-[var(--purple-primary)] to-[var(--purple-secondary)] text-white p-12 lg:p-20 relative overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(219,88,159,0.3),transparent_70%)]" />
      <div className="max-w-xl mx-auto relative">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">For Seekers</h2>
        <p className="text-lg text-purple-100 mb-10 leading-relaxed">
          Finding trusted local help shouldn&apos;t be hard. We&apos;ve built a platform that puts your community first.
        </p>
        <ul className="space-y-5 mb-10">
          {seekerBenefits.map((item) => (
            <li key={item} className="flex items-start gap-4">
              <div className="w-7 h-7 bg-gradient-to-br from-fuchsia-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-purple-50 text-lg">{item}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/service"
          className="inline-flex px-10 py-4 bg-white text-[var(--purple-primary)] rounded-2xl hover:bg-purple-50 hover:scale-105 transition-all font-bold shadow-2xl"
        >
          Start Searching
        </Link>
      </div>
    </div>

    <div id="for-providers" className="bg-gradient-to-br from-[var(--magenta)] to-fuchsia-600 text-white p-12 lg:p-20 relative overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(104,67,154,0.3),transparent_70%)]" />
      <div className="max-w-xl mx-auto relative">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">For Providers</h2>
        <p className="text-lg text-fuchsia-100 mb-10 leading-relaxed">
          Grow your business by connecting with customers in your own locality. No commissions, just connections.
        </p>
        <ul className="space-y-5 mb-10">
          {providerBenefits.map((item) => (
            <li key={item} className="flex items-start gap-4">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                <CheckIcon className="w-4 h-4 text-[var(--magenta)]" />
              </div>
              <span className="text-fuchsia-50 text-lg">{item}</span>
            </li>
          ))}
        </ul>
        {showBecomeProvider && (
          <Link
            to="/become-provider"
            className="inline-flex px-10 py-4 bg-white text-[var(--magenta)] rounded-2xl hover:bg-fuchsia-50 hover:scale-105 transition-all font-bold shadow-2xl"
          >
            Join as Provider
          </Link>
        )}
      </div>
    </div>
  </section>
  );
};

export default AudienceSection;
