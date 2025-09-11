import React from 'react'

const TermsConditionsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Terms & Conditions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            1. Acceptance of Terms
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              By accessing and using songIQ ("the Service"), you accept and agree to be bound 
              by the terms and provision of this agreement. If you do not agree to abide by 
              the above, please do not use this service.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            2. Description of Service
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              songIQ is an AI-powered music analysis platform that provides insights, 
              predictions, and recommendations for musical content. Our service includes:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Audio file analysis and processing</li>
              <li>Musical feature extraction and classification</li>
              <li>Success prediction algorithms</li>
              <li>Market trend analysis</li>
              <li>Performance tracking for released songs</li>
              <li>Recommendation systems</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3. User Accounts
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            4. Acceptable Use
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Upload content that infringes on intellectual property rights</li>
              <li>Upload malicious software or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            5. Intellectual Property Rights
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Your Content
              </h3>
              <p>
                You retain ownership of all audio files and content you upload to the Service. 
                By uploading content, you grant us a limited license to process, analyze, and 
                store your content solely for the purpose of providing our services.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Our Content
              </h3>
              <p>
                The Service and its original content, features, and functionality are owned by 
                songIQ and are protected by international copyright, trademark, patent, trade 
                secret, and other intellectual property laws.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            6. Payment Terms
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Certain features of the Service may require payment. By subscribing to paid 
              services, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Pay all fees and charges associated with your subscription</li>
              <li>Provide accurate billing information</li>
              <li>Authorize us to charge your payment method</li>
              <li>Understand that fees are non-refundable unless otherwise stated</li>
              <li>Cancel your subscription according to our cancellation policy</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            7. Privacy and Data Protection
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Your privacy is important to us. Our collection and use of personal information 
              is governed by our Privacy Policy, which is incorporated into these Terms by 
              reference. By using the Service, you consent to the collection and use of 
              information as described in our Privacy Policy.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            8. Disclaimers and Limitations
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Service Availability
              </h3>
              <p>
                The Service is provided "as is" and "as available" without warranties of any 
                kind. We do not guarantee that the Service will be uninterrupted or error-free.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Analysis Results
              </h3>
              <p>
                Our analysis results and predictions are for informational purposes only and 
                should not be considered as professional advice or guarantees of success.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Limitation of Liability
              </h3>
              <p>
                To the maximum extent permitted by law, songIQ shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            9. Termination
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We may terminate or suspend your account and access to the Service immediately, 
              without prior notice, for any reason, including breach of these Terms. Upon 
              termination, your right to use the Service will cease immediately.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            10. Changes to Terms
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of 
              any material changes by posting the new Terms on this page and updating the 
              "Last updated" date. Your continued use of the Service after such modifications 
              constitutes acceptance of the updated Terms.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            11. Governing Law
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of 
              the jurisdiction in which songIQ operates, without regard to conflict of law 
              principles.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            12. Contact Information
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              If you have any questions about these Terms & Conditions, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p><strong>Email:</strong> legal@songiq.ai</p>
              <p><strong>Website:</strong> songiq.ai</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default TermsConditionsPage
