import React from 'react'

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            1. Information We Collect
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Personal Information
              </h3>
              <p>
                When you create an account, we collect your email address, name, and any other 
                information you choose to provide. We may also collect payment information 
                when you subscribe to our premium services.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Audio Files
              </h3>
              <p>
                We collect and process the audio files you upload for analysis. These files 
                are stored securely and used solely for providing our music analysis services.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Usage Data
              </h3>
              <p>
                We automatically collect information about how you use our service, including 
                pages visited, features used, and time spent on the platform.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            2. How We Use Your Information
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <ul className="list-disc list-inside space-y-2">
              <li>Provide and improve our music analysis services</li>
              <li>Process your audio files and generate insights</li>
              <li>Communicate with you about your account and our services</li>
              <li>Send you important updates and notifications</li>
              <li>Provide customer support</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3. Information Sharing
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third 
              parties without your consent, except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With trusted service providers who assist in operating our platform</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            4. Data Security
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or 
              destruction. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure data storage and backup procedures</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            5. Your Rights
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access and review your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your personal data (subject to legal requirements)</li>
              <li>Object to processing of your personal data</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            6. Cookies and Tracking
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We use cookies and similar technologies to enhance your experience, analyze 
              usage patterns, and provide personalized content. You can control cookie 
              settings through your browser preferences.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            7. Data Retention
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We retain your personal information for as long as necessary to provide our 
              services and fulfill the purposes outlined in this privacy policy. Audio files 
              are retained according to your account settings and may be deleted upon request.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            8. Changes to This Policy
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We may update this privacy policy from time to time. We will notify you of any 
              material changes by posting the new policy on this page and updating the 
              "Last updated" date.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            9. Contact Us
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              If you have any questions about this privacy policy or our data practices, 
              please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p><strong>Email:</strong> privacy@songiq.ai</p>
              <p><strong>Website:</strong> songiq.ai</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
