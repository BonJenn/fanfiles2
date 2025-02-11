'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';

export default function TermsPage() {
  return (
    <SearchWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-screen-lg mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing or using our platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Content Guidelines</h2>
              <p className="text-gray-600 mb-4">
                You retain all rights to your content. By posting content, you grant us a license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on our platform.
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li className="mb-2">You must have the right to share any content you post</li>
                <li className="mb-2">Content must not violate any applicable laws or regulations</li>
                <li className="mb-2">Content must not infringe on intellectual property rights</li>
                <li>Content must adhere to our community guidelines</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prohibited Activities</h2>
              <p className="text-gray-600 mb-4">
                The following activities are strictly prohibited:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li className="mb-2">Violating any applicable laws or regulations</li>
                <li className="mb-2">Impersonating others or providing false information</li>
                <li className="mb-2">Interfering with the proper functioning of the platform</li>
                <li>Engaging in unauthorized data collection or mining</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Termination</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify or replace these terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms, please contact us at support@fanfiles.app.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SearchWrapper>
  );
}