'use client';

import Image from 'next/image';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { ArrowRight, DollarSign, Shield, BarChart, Users } from 'lucide-react';
import Link from 'next/link';
import { usePlatformStats } from '@/hooks/usePlatformStats';

export default function CreatorsPage() {
  const { data: stats, isLoading } = usePlatformStats();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    }
    return `${num}+`;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M+`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k+`;
    }
    return `$${amount.toFixed(0)}+`;
  };

  return (
    <SearchWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-screen-lg mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Turn Your Passion Into a Business
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of creators who are building sustainable businesses and meaningful connections with their audience.
                </p>
                <Link 
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Creating
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden">
                <Image
                  src="/creator-hero.jpg"
                  alt="Creator working on content"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-screen-lg mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {isLoading ? '...' : formatNumber(stats?.activeCreators || 0)}
                </div>
                <div className="text-gray-600">Active Creators</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {isLoading ? '...' : formatCurrency(stats?.totalEarnings || 0)}
                </div>
                <div className="text-gray-600">Paid to Creators</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {isLoading ? '...' : formatNumber(stats?.monthlyUsers || 0)}
                </div>
                <div className="text-gray-600">Monthly Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything You Need to Succeed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Flexible Monetization"
                description="Choose how you want to monetize your content with subscriptions, one-time purchases, or tips."
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Content Protection"
                description="Advanced DRM and watermarking to keep your content secure and protected."
              />
              <FeatureCard
                icon={<BarChart className="w-6 h-6" />}
                title="Analytics & Insights"
                description="Detailed analytics to understand your audience and optimize your content strategy."
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Community Tools"
                description="Built-in features to engage with your audience and build a thriving community."
              />
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Creator Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TestimonialCard
                quote="FanFiles has completely transformed how I share content with my audience. The platform's tools and support are unmatched."
                author="Sarah K."
                role="Digital Artist"
                image="/testimonial-1.jpg"
              />
              <TestimonialCard
                quote="The analytics and community features have helped me grow my audience faster than I ever thought possible."
                author="Michael R."
                role="Content Creator"
                image="/testimonial-2.jpg"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-screen-lg mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join our community of creators and start building your audience today.
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Create Your Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </SearchWrapper>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, image }: {
  quote: string;
  author: string;
  role: string;
  image: string;
}) {
  return (
    <div className="p-8 bg-gray-50 rounded-xl">
      <p className="text-gray-600 italic mb-6">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center">
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image
            src={image}
            alt={author}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-gray-600 text-sm">{role}</div>
        </div>
      </div>
    </div>
  );
}