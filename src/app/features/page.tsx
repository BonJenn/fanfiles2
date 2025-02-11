'use client';

import Image from 'next/image';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { Users, Shield, Zap, Heart, Share2, BarChart, Calendar, Settings } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <SearchWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-screen-lg mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Creators
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, share, and grow your content platform.
            </p>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-lg mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <FeatureSection
                icon={<Share2 className="w-12 h-12" />}
                title="Content Distribution"
                description="Share your content seamlessly across multiple platforms. Schedule posts, manage releases, and maintain consistent engagement with your audience."
                image="/features/content-distribution.jpg"
              />
              <FeatureSection
                icon={<BarChart className="w-12 h-12" />}
                title="Analytics Dashboard"
                description="Track your growth with detailed analytics. Monitor engagement, understand your audience, and make data-driven decisions to optimize your content strategy."
                image="/features/analytics.jpg"
              />
              <FeatureSection
                icon={<Calendar className="w-12 h-12" />}
                title="Content Calendar"
                description="Plan and organize your content schedule efficiently. Set release dates, manage drafts, and maintain a consistent posting schedule."
                image="/features/calendar.jpg"
              />
              <FeatureSection
                icon={<Settings className="w-12 h-12" />}
                title="Customization Tools"
                description="Personalize your profile and content presentation. Create a unique brand identity that resonates with your audience."
                image="/features/customization.jpg"
              />
            </div>
          </div>
        </div>

        {/* Additional Features List */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">More Powerful Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SmallFeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Community Management"
                description="Tools to engage with your community and manage interactions effectively."
              />
              <SmallFeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Content Protection"
                description="Advanced security features to protect your intellectual property."
              />
              <SmallFeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Performance Optimization"
                description="Automated tools to enhance your content's reach and impact."
              />
            </div>
          </div>
        </div>
      </div>
    </SearchWrapper>
  );
}

function FeatureSection({ icon, title, description, image }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-blue-600">{icon}</div>
      <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <div className="relative h-48 mt-4 rounded-xl overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}

function SmallFeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
} 