import React, { useState } from 'react';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
    <div className='min-h-screen bg-gray-50 pb-16'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold text-black mb-6'>
            Frequently Asked Questions
          </h1>
          <p className='text-gray-600 text-lg md:text-xl max-w-3xl mx-auto'>
            Find answers to common questions about Commun and how our platform works.
          </p>
        </div>

        {/* FAQ List */}
        <div className='max-w-4xl mx-auto space-y-4 mb-16'>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className='bg-white border-2 border-black rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300'
            >
              <button
                onClick={() => toggleFAQ(index)}
                className='w-full p-6 text-left flex items-center justify-between focus:outline-none hover:bg-gray-50 transition-colors'
              >
                <h3 className='text-lg md:text-xl font-bold text-black pr-4'>
                  {faq.question}
                </h3>
                <div className='flex-shrink-0 text-black'>
                  {openIndex === index ? (
                    <HiOutlineChevronUp className='w-6 h-6' />
                  ) : (
                    <HiOutlineChevronDown className='w-6 h-6' />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className='px-6 pb-6 pt-0'>
                  <div className='border-t-2 border-gray-200 pt-6'>
                    <p className='text-gray-700 leading-relaxed'>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions Section */}
        <div className='max-w-3xl mx-auto'>
          <div className='bg-white border-2 border-black rounded-xl p-8 md:p-12 text-center'>
            <h2 className='text-2xl md:text-3xl font-bold text-black mb-4'>
              Still Have Questions?
            </h2>
            <p className='text-gray-600 mb-8'>
              Can't find what you're looking for? Feel free to reach out to us through our contact page.
            </p>
            <a
              href='/contact'
              className='inline-block px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors'
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
