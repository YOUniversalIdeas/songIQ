import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

const Footer: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showContactForm, setShowContactForm] = useState(false);
  const contactFormRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContactUsClick = () => {
    setShowContactForm(!showContactForm);
    
    // If opening the form, scroll to the form after a brief delay to allow DOM update
    if (!showContactForm) {
      setTimeout(() => {
        if (contactFormRef.current) {
          contactFormRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        } else {
          // Fallback to top of page if ref not available
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      console.log('📤 Sending contact form to:', `${API_BASE_URL}/api/contact`);
      console.log('📝 Form data:', contactForm);
      
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      console.log('📨 Response status:', response.status);
      const result = await response.json();
      console.log('📋 Response data:', result);

      if (result.success) {
        setSubmitStatus('success');
        setContactForm({ firstName: '', lastName: '', email: '', message: '' });
        // Auto-close form after 3 seconds
        setTimeout(() => {
          setShowContactForm(false);
        }, 3000);
      } else {
        console.error('Contact form error:', result.error);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              songIQ
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
              Unlock your song's potential with AI-powered music analysis. 
              Get professional insights, market comparisons, and success predictions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/upload" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Upload Song
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/trends" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Music Trends
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <button
                  onClick={handleContactUsClick}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Form - Expandable */}
        {showContactForm && (
          <div ref={contactFormRef} className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                Contact Us
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={contactForm.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First Name"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={contactForm.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last Name"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Your message..."
                    rows={4}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
                {submitStatus === 'success' && (
                  <p className="text-sm text-green-600 dark:text-green-400 text-center">
                    Message sent successfully!
                  </p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    Failed to send message. Please try again.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} songIQ. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 md:mt-0">
              Powered by AI • Built for Musicians
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
