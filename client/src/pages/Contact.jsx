import React, { useState } from 'react';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

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
    {
      icon: <HiOutlineLocationMarker className="w-8 h-8" />,
      title: "Visit Us",
      content: "Your Community",
      description: "We're everywhere you are"
    },
    {
      icon: <HiOutlineClock className="w-8 h-8" />,
      title: "Response Time",
      content: "Within 24 hours",
      description: "We aim to respond quickly"
    }
  ];

  return (
    <div className='min-h-screen bg-gray-50 pb-16'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold text-black mb-6'>
            Contact Us
          </h1>
          <p className='text-gray-600 text-lg md:text-xl max-w-3xl mx-auto'>
            Have a question or need help? We're here to assist you. Reach out to us through the form below or use our contact information.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Contact Information */}
          <div>
            <h2 className='text-2xl md:text-3xl font-bold text-black mb-8'>
              Get in Touch
            </h2>
            <p className='text-gray-700 mb-8 leading-relaxed'>
              We'd love to hear from you. Whether you have a question about our services, need help with your account, or want to provide feedback, our team is ready to help.
            </p>
            
            <div className='space-y-6 mb-8'>
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className='bg-white border-2 border-black rounded-xl p-6 hover:shadow-lg transition-all duration-300'
                >
                  <div className='flex items-start gap-4'>
                    <div className='text-black flex-shrink-0'>
                      {info.icon}
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-black mb-1'>
                        {info.title}
                      </h3>
                      <p className='text-gray-800 font-semibold mb-1'>
                        {info.content}
                      </p>
                      <p className='text-gray-600 text-sm'>
                        {info.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className='bg-white border-2 border-black rounded-xl p-6'>
              <h3 className='text-xl font-bold text-black mb-3'>
                Need Immediate Help?
              </h3>
              <p className='text-gray-700 mb-4'>
                For urgent matters, please use the contact form and mark your message as urgent. We prioritize urgent requests and will respond as quickly as possible.
              </p>
              <p className='text-gray-600 text-sm'>
                You can also browse our <a href='/faq' className='text-black font-semibold underline hover:text-gray-700'>FAQ page</a> for quick answers to common questions.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className='bg-white border-2 border-black rounded-xl p-8'>
              <h2 className='text-2xl md:text-3xl font-bold text-black mb-6'>
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Name */}
                <div>
                  <label htmlFor='name' className='block text-sm font-semibold text-black mb-2'>
                    Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                      errors.name ? 'border-red-500' : 'border-black'
                    }`}
                    placeholder='Enter your full name'
                  />
                  {errors.name && (
                    <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor='email' className='block text-sm font-semibold text-black mb-2'>
                    Email <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                      errors.email ? 'border-red-500' : 'border-black'
                    }`}
                    placeholder='Enter your email address'
                  />
                  {errors.email && (
                    <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label htmlFor='phone' className='block text-sm font-semibold text-black mb-2'>
                    Phone Number <span className='text-gray-500 text-xs'>(Optional)</span>
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all'
                    placeholder='Enter your phone number'
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor='subject' className='block text-sm font-semibold text-black mb-2'>
                    Subject <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='subject'
                    name='subject'
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                      errors.subject ? 'border-red-500' : 'border-black'
                    }`}
                    placeholder='What is this regarding?'
                  />
                  {errors.subject && (
                    <p className='text-red-500 text-sm mt-1'>{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor='message' className='block text-sm font-semibold text-black mb-2'>
                    Message <span className='text-red-500'>*</span>
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none ${
                      errors.message ? 'border-red-500' : 'border-black'
                    }`}
                    placeholder='Tell us more about your question or concern...'
                  />
                  {errors.message && (
                    <p className='text-red-500 text-sm mt-1'>{errors.message}</p>
                  )}
                  <p className='text-gray-500 text-xs mt-1'>
                    {formData.message.length} characters (minimum 10)
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 bg-black text-white font-semibold rounded-lg transition-all ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-800 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className='text-gray-600 text-sm text-center'>
                  By submitting this form, you agree to our terms of service and privacy policy.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className='mt-16 text-center'>
          <div className='bg-white border-2 border-black rounded-xl p-8 max-w-3xl mx-auto'>
            <h3 className='text-2xl font-bold text-black mb-4'>
              Before You Contact Us
            </h3>
            <p className='text-gray-700 mb-6'>
              Many questions are already answered in our Frequently Asked Questions section. Check there first for quick solutions!
            </p>
            <a
              href='/faq'
              className='inline-block px-8 py-3 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-colors'
            >
              Visit FAQ Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
