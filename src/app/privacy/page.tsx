'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';

export default function PrivacyPage() {
  return (
    <SearchWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-screen-lg mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-md mx-auto prose prose-lg">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect information that you provide directly to us when using our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li className="mb-2">Account information (name, email, password)</li>
                <li className="mb-2">Profile information (biography, profile picture)</li>
                <li className="mb-2">Content you create and share</li>
                <li className="mb-2">Payment information (processed securely by our payment providers)</li>
                <li>Communications with us and other users</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li className="mb-2">Provide, maintain, and improve our services</li>
                <li className="mb-2">Process your transactions</li>
                <li className="mb-2">Send you technical notices and support messages</li>
                <li className="mb-2">Communicate with you about products, services, and events</li>
                <li>Protect against malicious or fraudulent activity</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li className="mb-2">With your consent</li>
                <li className="mb-2">With service providers who assist our operations</li>
                <li className="mb-2">To comply with legal obligations</li>
                <li>To protect rights and safety of users and third parties</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-600 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li className="mb-2">Access your personal information</li>
                <li className="mb-2">Correct inaccurate information</li>
                <li className="mb-2">Request deletion of your information</li>
                <li className="mb-2">Object to processing of your information</li>
                <li>Withdraw consent where applicable</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Age Restriction</h2>
              <p className="text-gray-600 mb-4">
                Users must be 18 years or older to have an account on FanFiles or use the FanFiles service in any capacity.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Privacy Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at privacy@example.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SearchWrapper>
  );
}