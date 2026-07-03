import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react'; 

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  const faqs = [
    {
      question: 'What is CommuN?',
      answer:
        'CommuN is a community marketplace platform that connects neighbours with local service providers. Whether you need tutoring, home cooking, fitness training, or any other service, we help you find verified providers right in your society.',
    },
    {
      question: 'How do I book a service?',
      answer:
        "Browse through our services, click on any service that interests you, review the provider's profile and portfolio, then click 'Order Now' to book. You'll be able to communicate with the provider and arrange the details of your service.",
    },
    {
      question: 'How do I become a service provider?',
      answer:
        "If you have a skill to share, you can become a provider by clicking 'Become Provider' in the navigation menu. Fill out the provider profile form, add your services with descriptions, images, and pricing. Once submitted and verified, your services will be available for your neighbours to book.",
    },
    {
      question: 'Are providers verified?',
      answer:
        'Yes, all providers on our platform go through a verification process. We ensure that providers are legitimate members of the community and that their services meet our quality standards.',
    },
    {
      question: 'What types of services are available?',
      answer:
        'We offer a wide range of services including Academics, Music, Dance, Fitness & Sports, Home Cooking, Home Baker, Technology, Photography, Art & Craft, and many more. Browse our categories page to see all available service types.',
    },
    {
      question: 'How do I search for services?',
      answer:
        "You can search for services using the search bar in the navbar. When you click on it, you'll see all available categories. Start typing to search for specific services by keyword, category, or provider name.",
    },
    {
      question: 'Can I leave reviews for services?',
      answer:
        'Yes! After using a service, you can leave reviews and ratings to help other community members make informed decisions. Reviews help maintain quality and build trust within the community.',
    },
    {
      question: 'Is there a fee to use CommuN?',
      answer:
        'CommuN is free to browse and search. Service providers set their own prices for their services. Any transaction fees or payment details will be handled directly between you and the provider.',
    },
    {
      question: 'How do I contact a provider?',
      answer:
        "Once you book a service, you'll be able to communicate with the provider through our platform. Contact details and communication methods will be provided after booking confirmation.",
    },
    {
      question: "What if I'm not satisfied with a service?",
      answer:
        'We encourage open communication between customers and providers. If you have any concerns, please reach out to the provider first. You can also leave feedback through our review system. For serious issues, please contact our support team.',
    },
    {
      question: 'Can I cancel a booking?',
      answer:
        'Booking cancellation policies may vary by provider. We recommend discussing cancellation terms with your provider before booking. Always check the service details for any specific cancellation policies.',
    },
    {
      question: 'How do I update my profile or services?',
      answer:
        "If you're a provider, open Provider Dashboard from the menu, then use Update Profile or Manage Services to keep your information current and help customers find you easily.",
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

      {/* FAQ list */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <motion.div
                  key={faq.question}
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
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)]/30 hover:bg-purple-50/30 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
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
                        id={`faq-panel-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 ml-[3.25rem] sm:ml-[3.75rem]">
                          <div className="border-t border-purple-100 pt-4">
                            <p className="text-[var(--text-secondary)] leading-relaxed">{faq.answer}</p>
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
      </section>

      {/* Contact CTA */}
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
