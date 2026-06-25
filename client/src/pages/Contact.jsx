import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, Clock, ChevronRight, MessageCircle } from 'lucide-react';
import emailjs from '@emailjs/browser'; 

const EMAILJS_SERVICE_ID = 'service_j70psri';
const EMAILJS_TEMPLATE_ID = 'template_rtmto2q';
const EMAILJS_PUBLIC_KEY = 'CHh6M29utstehJebQ';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

const Card = ({ children, className = '' }) => (
  <div
    className={`relative bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-6 sm:p-8 shadow-lg shadow-purple-500/5 ${className}`}
  >
    {children}
  </div>
);

const inputBase =
  'w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)] transition-all duration-300';
const inputOk = 'border-purple-100';
const inputErr = 'border-red-300 focus:ring-red-400/30 focus:border-red-400 bg-red-50';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          from_phone: formData.phone || 'N/A',
          subject: formData.subject,
          message: formData.message,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );

      toast.success("Thank you for contacting us! We'll get back to you soon.");
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      color: 'from-purple-500 to-fuchsia-500',
      title: 'Email Us',
      content: 'info@commun.in',
      href: 'mailto:info@commun.in',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      color: 'from-pink-500 to-rose-500',
      title: 'Call Us',
      content: '+91 76781 71765',
      href: 'tel:+917678171765',
      description: 'Mon to Fri, 9am to 6pm',
    },
    {
      icon: Clock,
      color: 'from-emerald-500 to-teal-500',
      title: 'Response Time',
      content: 'Within 24 hours',
      description: 'We aim to respond quickly',
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
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
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
                We&apos;re Here to Help
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-6 leading-[1.1]">
              Contact Us
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Have a question or need help? Reach out through the form below or use our contact
              information — we&apos;re here for neighbours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
                Get in Touch
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                We&apos;d love to hear from you. Whether you have a question about our services,
                need help with your account, or want to provide feedback, our team is ready to help.
              </p>

              <div className="space-y-4 mb-8">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={info.title}
                      {...fadeUp}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Card className="hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all group">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                              {info.title}
                            </h3>
                            {info.href ? (
                              <a
                                href={info.href}
                                className="text-[var(--purple-primary)] font-semibold mb-1 inline-block hover:underline"
                              >
                                {info.content}
                              </a>
                            ) : (
                              <p className="text-[var(--text-primary)] font-semibold mb-1">
                                {info.content}
                              </p>
                            )}
                            <p className="text-[var(--text-secondary)] text-sm">{info.description}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div {...fadeUp}>
                <Card className="bg-gradient-to-br from-purple-50/80 to-fuchsia-50/50 border-purple-200/60">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                    Need Immediate Help?
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
                    For urgent matters, use the contact form and mark your message as urgent. We
                    prioritize urgent requests and respond as quickly as possible.
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    You can also browse our{' '}
                    <Link
                      to="/faq"
                      className="text-[var(--purple-primary)] font-semibold hover:underline"
                    >
                      FAQ page
                    </Link>{' '}
                    for quick answers to common questions.
                  </p>
                </Card>
              </motion.div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    Send us a Message
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <motion.p className="text-red-500 text-sm mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <motion.p className="text-red-500 text-sm mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Phone Number{' '}
                      <span className="text-[var(--text-secondary)] text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${inputBase} ${inputOk}`}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`${inputBase} ${errors.subject ? inputErr : inputOk}`}
                      placeholder="What is this regarding?"
                    />
                    {errors.subject && (
                      <motion.p className="text-red-500 text-sm mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {errors.subject}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className={`${inputBase} resize-none ${errors.message ? inputErr : inputOk}`}
                      placeholder="Tell us more about your question or concern..."
                    />
                    {errors.message && (
                      <motion.p className="text-red-500 text-sm mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {errors.message}
                      </motion.p>
                    )}
                    <p className="text-[var(--text-secondary)] text-xs mt-1">
                      {formData.message.length} characters (minimum 10)
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/20 ${
                      isSubmitting
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]'
                    }`}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>

                  <p className="text-[var(--text-secondary)] text-sm text-center">
                    By submitting this form, you agree to our terms of service and privacy policy.
                  </p>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ prompt */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <Card>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Before You Contact Us
              </h3>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                Many questions are already answered in our FAQ section. Check there first for quick
                solutions!
              </p>
              <Link
                to="/faq"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-200 text-[var(--purple-primary)] font-semibold rounded-2xl hover:bg-purple-50 hover:border-[var(--purple-primary)] transition-all"
              >
                Visit FAQ Page
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
 
    </motion.div>
  );
};

export default Contact;
