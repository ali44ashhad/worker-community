import React, { useState } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  const faqs = [
    {
      question: "What is Commun?",
      answer: "Commun is a community marketplace platform that connects neighbors with local service providers. Whether you need tutoring, home cooking, fitness training, or any other service, we help you find verified providers right in your society."
    },
    {
      question: "How do I book a service?",
      answer: "Browse through our services, click on any service that interests you, review the provider's profile and portfolio, then click 'Order Now' to book. You'll be able to communicate with the provider and arrange the details of your service."
    },
    {
      question: "How do I become a service provider?",
      answer: "If you have a skill to share, you can become a provider by clicking 'Become Provider' in the navigation menu. Fill out the provider profile form, add your services with descriptions, images, and pricing. Once submitted and verified, your services will be available for your neighbors to book."
    },
    {
      question: "Are providers verified?",
      answer: "Yes, all providers on our platform go through a verification process. We ensure that providers are legitimate members of the community and that their services meet our quality standards."
    },
    {
      question: "What types of services are available?",
      answer: "We offer a wide range of services including Academics, Music, Dance, Fitness & Sports, Home Cooking, Home Baker, Technology, Photography, Art & Craft, and many more. Browse our categories page to see all available service types."
    },
    {
      question: "How do I search for services?",
      answer: "You can search for services using the search bar in the navbar. When you click on it, you'll see all available categories. Start typing to search for specific services by keyword, category, or provider name."
    },
    {
      question: "Can I leave reviews for services?",
      answer: "Yes! After using a service, you can leave reviews and ratings to help other community members make informed decisions. Reviews help maintain quality and build trust within the community."
    },
    {
      question: "Is there a fee to use Commun?",
      answer: "Commun is free to browse and search. Service providers set their own prices for their services. Any transaction fees or payment details will be handled directly between you and the provider."
    },
    {
      question: "How do I contact a provider?",
      answer: "Once you book a service, you'll be able to communicate with the provider through our platform. Contact details and communication methods will be provided after booking confirmation."
    },
    {
      question: "What if I'm not satisfied with a service?",
      answer: "We encourage open communication between customers and providers. If you have any concerns, please reach out to the provider first. You can also leave feedback through our review system. For serious issues, please contact our support team."
    },
    {
      question: "Can I cancel a booking?",
      answer: "Booking cancellation policies may vary by provider. We recommend discussing cancellation terms with your provider before booking. Always check the service details for any specific cancellation policies."
    },
    {
      question: "How do I update my profile or services?",
      answer: "If you're a provider, you can update your profile and services by clicking 'Update Profile' or 'Update Services' in the navigation menu. Make sure to keep your information current to help customers find you easily."
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-[1370px] mx-auto px-6 pt-28 relative">
        {/* Decorative glass blobs */}
        <div className="pointer-events-none absolute -top-12 -left-10 w-72 h-72 rounded-full blur-3xl bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50 opacity-30 transform -rotate-12" />
        <div className="pointer-events-none absolute -bottom-12 -right-6 w-60 h-60 rounded-full blur-2xl bg-gradient-to-br from-pink-50 via-indigo-50 to-yellow-50 opacity-25 transform rotate-6" />

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-4">
            <span>Frequently Asked</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Questions</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Find quick answers about Commun — how it works, booking, verification and more.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-start justify-between gap-4 focus:outline-none hover:bg-white/30 transition-colors duration-300"
                whileTap={{ scale: 0.98 }}
                aria-expanded={openIndex === index}
                aria-controls={`faq-panel-${index}`}
              >
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 pr-4 tracking-tight">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 hidden md:block">Click to expand and read the full answer.</p>
                </div>
                <motion.div
                  className="flex-shrink-0 text-gray-600 pt-1"
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <HiOutlineChevronDown className="w-6 h-6" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-panel-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="border-t border-gray-200 pt-6">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-md">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Can't find what you're looking for? Reach out via our contact page — we'd be happy to help.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to='/contact'
                className='inline-block px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300'
              >
                Contact Us
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
