import React, { useState } from 'react';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
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
      // TODO: Replace with actual API endpoint when backend is ready
      // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      // const response = await fetch(`${API_URL}/api/contact`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   credentials: 'include',
      //   body: JSON.stringify(formData)
      // });
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Thank you for contacting us! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setErrors({});
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <HiOutlineMail className="w-8 h-8" />,
      title: "Email Us",
      content: "support@commun.com",
      description: "Send us an email anytime"
    },
    {
      icon: <HiOutlinePhone className="w-8 h-8" />,
      title: "Call Us",
      content: "+1 (555) 123-4567",
      description: "Mon to Fri, 9am to 6pm"
    },
    // {
    //   icon: <HiOutlineLocationMarker className="w-8 h-8" />,
    //   title: "Visit Us",
    //   content: "Your Community",
    //   description: "We're everywhere you are"
    // },
    {
      icon: <HiOutlineClock className="w-8 h-8" />,
      title: "Response Time",
      content: "Within 24 hours",
      description: "We aim to respond quickly"
    }
  ];

  return (
    <div className='min-h-screen bg-white pb-16'>
      <div className='max-w-[1350px] mx-auto px-6 pt-28'>
        {/* Header */}
        <motion.div 
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight'>
            Contact Us
          </h1>
          <p className='text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed'>
            Have a question or need help? We're here to assist you. Reach out to us through the form below or use our contact information.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-8 tracking-tight'>
              Get in Touch
            </h2>
            <p className='text-gray-600 mb-8 leading-relaxed'>
              We'd love to hear from you. Whether you have a question about our services, need help with your account, or want to provide feedback, our team is ready to help.
            </p>
            
            <div className='space-y-6 mb-8'>
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className='bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <div className='flex items-start gap-4'>
                    <div className='text-gray-700 flex-shrink-0'>
                      {info.icon}
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                        {info.title}
                      </h3>
                      <p className='text-gray-700 font-semibold mb-1'>
                        {info.content}
                      </p>
                      <p className='text-gray-500 text-sm'>
                        {info.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div 
              className='bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className='text-xl font-bold text-gray-900 mb-3 tracking-tight'>
                Need Immediate Help?
              </h3>
              <p className='text-gray-600 mb-4 leading-relaxed'>
                For urgent matters, please use the contact form and mark your message as urgent. We prioritize urgent requests and will respond as quickly as possible.
              </p>
              <p className='text-gray-500 text-sm'>
                You can also browse our <Link to='/faq' className='text-gray-900 font-semibold hover:underline'>FAQ page</Link> for quick answers to common questions.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className='bg-white border border-gray-200 rounded-2xl p-8 shadow-lg'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-8 tracking-tight'>
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Name */}
                <div>
                  <label htmlFor='name' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 ${
                      errors.name ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder='Enter your full name'
                  />
                  {errors.name && (
                    <motion.p 
                      className='text-red-500 text-sm mt-1'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Email <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 ${
                      errors.email ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder='Enter your email address'
                  />
                  {errors.email && (
                    <motion.p 
                      className='text-red-500 text-sm mt-1'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label htmlFor='phone' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Phone Number <span className='text-gray-500 text-xs'>(Optional)</span>
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300'
                    placeholder='Enter your phone number'
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor='subject' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Subject <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='subject'
                    name='subject'
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 ${
                      errors.subject ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder='What is this regarding?'
                  />
                  {errors.subject && (
                    <motion.p 
                      className='text-red-500 text-sm mt-1'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.subject}
                    </motion.p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor='message' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Message <span className='text-red-500'>*</span>
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 resize-none ${
                      errors.message ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder='Tell us more about your question or concern...'
                  />
                  {errors.message && (
                    <motion.p 
                      className='text-red-500 text-sm mt-1'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.message}
                    </motion.p>
                  )}
                  <p className='text-gray-500 text-xs mt-1'>
                    {formData.message.length} characters (minimum 10)
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type='submit'
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-6 bg-gray-900 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-800 hover:shadow-xl'
                  }`}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>

                <p className='text-gray-500 text-sm text-center'>
                  By submitting this form, you agree to our terms of service and privacy policy.
                </p>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Link */}
        <motion.div 
          className='mt-16 text-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className='bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-3xl mx-auto shadow-lg'>
            <h3 className='text-2xl font-bold text-gray-900 mb-4 tracking-tight'>
              Before You Contact Us
            </h3>
            <p className='text-gray-600 mb-6 leading-relaxed'>
              Many questions are already answered in our Frequently Asked Questions section. Check there first for quick solutions!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to='/faq'
                className='inline-block px-8 py-3.5 border-2 border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300'
              >
                Visit FAQ Page
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
