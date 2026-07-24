import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

const faqSections = [
  {
    title: 'General',
    faqs: [
      {
        question: 'What is CommuN?',
        answer:
          "CommuN is India's first Neighbourhood Operating System (N.O.S.)— a hyperlocal platform that helps residents discover trusted local services, home businesses, professionals, and opportunities within their own neighbourhood.",
      },
      {
        question: 'Why was CommuN created?',
        answer:
          'We realised that every neighbourhood is full of talented individuals and trusted service providers, yet most remain undiscovered. Residents often rely on WhatsApp groups, referrals, Google searches, or social media to find local services. CommuN brings everything together in one organised, searchable platform.',
      },
      {
        question: 'What makes CommuN different?',
        answer:
          'CommuN is built exclusively for neighbourhoods. Unlike search engines, directories, or social media, the platform focuses on helping residents discover and connect with trusted people and services within their own CommuNity.',
      },
      {
        question:
          'Why should I use CommuN when I already have WhatsApp, Google or an existing Society management app?',
        answer:
          'Because those platforms were built for different purposes. WhatsApp is designed for conversations, Google for searching the internet, and society management apps for managing gated CommuNities. CommuN is built exclusively for neighbourhood discovery—helping residents easily find trusted local services while giving neighbourhood entrepreneurs lasting visibility. Instead of searching across multiple apps, CommuN brings your neighbourhood together in one organised, searchable place.',
      },
    ],
  },
  {
    title: 'For Residents',
    faqs: [
      {
        question: 'How can CommuN help me?',
        answer:
          'CommuN helps you discover trusted local services nearby, such as:\n• Home tutors\n• Fitness trainers\n• Home bakers\n• Music teachers\n• Doctors\n• Lawyers\n• Architects\n• Electricians\n• Plumbers\n• Event planners\n• Pet services\n…and much more.',
      },
      {
        question: 'Is CommuN free to use?',
        answer: 'Yes! Browsing and discovering local services is completely free for residents.',
      },
      {
        question: 'Why should I use CommuN instead of WhatsApp?',
        answer:
          'WhatsApp is great for conversations, but not for discovery. Messages disappear quickly, information gets buried, and the same questions get asked repeatedly. CommuN keeps neighbourhood services organised, searchable, and available whenever you need them.',
      },
      {
        question: 'Why not just search on Google?',
        answer:
          'Google shows businesses across a broad area. CommuN helps you discover trusted people and services within your own neighbourhood—often including home-based businesses and professionals who may not even appear on Google.',
      },
      {
        question: 'How do I search for services on the platform?',
        answer:
          "You can search for services using the search bar in the navbar. When you click on it, you'll see all available categories. Start typing to search for specific services by keyword, category, or provider name.",
      },
      {
        question: 'Can I contact providers directly?',
        answer:
          'Yes! You can connect directly with providers through the contact information available on their profile.',
      },
      {
        question: 'What if I\'m not satisfied with a service?',
        answer:
          'We encourage open communication between customers and providers. If you have any concerns, please reach out to the provider first. You can also leave feedback through our review system. For serious issues, please contact our support team.',
      },
      {
        question: 'Can I leave reviews?',
        answer:
          'Yes! After using a service (getting in touch with the provider through the platform), you can leave reviews and ratings to help other community members make informed decisions. Reviews help maintain quality and build trust within the community.',
      },
      {
        question: 'Can I give ratings to any provider?',
        answer:
          'Yes! After using a service (getting in touch with the provider through the platform), you can give the provider star rating based on your satisfaction to the services provided to you.',
      },
    ],
  },
  {
    title: 'For Service Providers',
    faqs: [
      {
        question: 'Who can register as a provider?',
        answer:
          'Anyone offering a genuine product or service within the CommuNity can register, including:\n• Tutors\n• Fitness trainers\n• Home bakers\n• Consultants\n• Freelancers\n• Artists\n• Doctors\n• Lawyers\n• Coaches\n• Home businesses\n• Local professionals',
      },
      {
        question: 'Why should I list my services on CommuN?',
        answer:
          'CommuN helps you become visible to people most likely to become your customers—your neighbours. Instead of relying solely on word-of-mouth or repeated WhatsApp posts, your services remain discoverable whenever someone is looking.',
      },
      {
        question: 'Is listing free?',
        answer: 'Yes! Listing your service is completely free.',
      },
      {
        question: 'Will I receive enquiries directly?',
        answer:
          'Yes! Interested residents can contact you using the details shared on your profile.',
      },
      {
        question: 'Can I update my profile?',
        answer:
          'Absolutely. You can update your profile, services, and contact details whenever needed. Open Provider Dashboard from the menu, then use Update Profile or Manage Services to keep your information current and help customers find you easily.',
      },
    ],
  },
  {
    title: 'Trust & Safety',
    faqs: [
      {
        question: 'Are all providers verified?',
        answer:
          'CommuN encourages genuine listings and aims to build a trusted CommuNity. All users get verified by the registered community representatives before becoming a part of one. Verification features will continue to evolve as the platform grows.',
      },
      {
        question: 'Does CommuN recommend providers?',
        answer:
          'CommuN provides a platform for discovery. Residents are encouraged to review provider profiles and choose the service that best meets their needs.',
      },
      {
        question: 'Is my personal information safe?',
        answer:
          'Yes! We take privacy seriously and only display the information you choose to make public.',
      },
    ],
  },
  {
    title: 'The Platform',
    faqs: [
      {
        question: 'Which areas does CommuN currently serve?',
        answer:
          'CommuN is currently expanding Community by Community. New neighbourhoods will continue to be added over time and updated on the platform.',
      },
      {
        question: 'Can I suggest my neighbourhood?',
        answer:
          "Absolutely. We'd love to hear from you. If your CommuNity isn't available yet, get in touch with us and we'll consider it for future expansion.",
      },
      {
        question: 'What features are coming next?',
        answer:
          'CommuN is continuously evolving. Future updates will include:\n• CommuNity groups\n• Local events\n• Secure payments\n• Resident recommendations\n• RWA tools\n• Announcements\n• Neighbourhood commerce\n• AI-powered local discovery',
      },
    ],
  },
  {
    title: 'Account',
    faqs: [
      {
        question: 'How do I create an account?',
        answer:
          'Simply register using your email address or mobile number and follow the onboarding steps.',
      },
      {
        question: 'Can I register as both a resident and a provider?',
        answer:
          'Yes. Many residents also offer products or services, and CommuN supports both roles.',
      },
      {
        question: 'Can I edit or delete my account?',
        answer:
          'Yes! You can manage or delete your account at any time through your profile settings or by contacting our support team.',
      },
      {
        question: 'If I shift from one society to another, how do I join the new society?',
        answer:
          'You can simply send us a request at info@commun.in and mention all details. Our backend team will help you out within 24 hours.',
      },
    ],
  },
  {
    title: 'Support',
    faqs: [
      {
        question: 'How can I contact CommuN?',
        answer: "You can reach us at info@commun.in, and we'll be happy to assist you.",
      },
      {
        question: 'I have a suggestion. How can I share it?',
        answer:
          'We welcome feedback from our CommuNity. Simply email us at info@commun.in with your ideas or suggestions.',
      },
    ],
  },
  {
    title: 'Vision',
    faqs: [
      {
        question: 'Is CommuN just another directory?',
        answer:
          'No! CommuN is much more than a directory. Our vision is to become the digital operating system for neighbourhoods—bringing together discovery, CommuNity engagement, local commerce, and neighbourhood management into one trusted platform.',
      },
    ],
  },
];

const FAQ = () => {
  const [openKey, setOpenKey] = useState(null);

  const toggleFAQ = (key) => setOpenKey(openKey === key ? null : key);

  let itemIndex = 0;

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
                Help Center
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-6 leading-[1.1]">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Find quick answers about CommuN — how it works, booking, verification and more.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[var(--text-primary)] sm:text-xl">
                <span aria-hidden>📌</span>
                {section.title.toUpperCase()}
              </h2>
              <div className="space-y-4">
                {section.faqs.map((faq) => {
                  const key = `${section.title}-${faq.question}`;
                  const isOpen = openKey === key;
                  const index = itemIndex;
                  itemIndex += 1;

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (index % 6) * 0.04 }}
                      className={`bg-white/80 backdrop-blur-sm border rounded-3xl overflow-hidden transition-all duration-300 ${
                        isOpen
                          ? 'border-purple-300 shadow-lg shadow-purple-500/10'
                          : 'border-purple-100/50 shadow-md shadow-purple-500/5 hover:border-purple-200 hover:shadow-lg'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFAQ(key)}
                        className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)]/30 hover:bg-purple-50/30 transition-colors"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${key}`}
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <span
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              isOpen
                                ? 'bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] text-white'
                                : 'bg-purple-50 text-[var(--purple-primary)]'
                            }`}
                          >
                            <HelpCircle className="w-4 h-4" />
                          </span>
                          <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] pr-2">
                            {faq.question}
                          </h3>
                        </div>
                        <motion.span
                          className="flex-shrink-0 text-[var(--purple-primary)] pt-1"
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`faq-panel-${key}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 ml-[3.25rem] sm:ml-[3.75rem]">
                              <div className="border-t border-purple-100 pt-4">
                                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 sm:p-12 text-center shadow-lg shadow-purple-500/5">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
                Still Have Questions?
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                Can&apos;t find what you&apos;re looking for? Reach out via our contact page — we&apos;d
                be happy to help.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transition-all"
              >
                Contact Us
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default FAQ;