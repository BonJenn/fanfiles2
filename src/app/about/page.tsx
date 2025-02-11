'use client';

import Image from 'next/image';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { Users, Shield, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <SearchWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="max-w-screen-lg mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Empowering Creators, 
              <br />
              Connecting Communities
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              FanFiles is a platform built for creators to share their passion and connect with their biggest supporters in meaningful ways.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-lg mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-4">
                  We believe in a future where creators can build sustainable careers doing what they love. FanFiles provides the tools and platform needed to make this vision a reality.
                </p>
                <p className="text-lg text-gray-600">
                  By connecting creators directly with their supporters, we're building a more personal and rewarding creative economy.
                </p>
              </div>
              <div className="relative h-64 md:h-96">
                <Image
                  src="/about-mission.jpg"
                  alt="Creator working"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose FanFiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Community First"
                description="Build meaningful connections with your supporters in a safe and engaging environment."
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="Secure Platform"
                description="Your content and data are protected with industry-leading security measures."
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Powerful Tools"
                description="Access analytics, scheduling, and automation tools to grow your audience."
              />
              <FeatureCard
                icon={<Heart className="w-8 h-8" />}
                title="Creator Support"
                description="Get the help you need with our dedicated creator support team."
              />
            </div>
          </div>
        </div>

        
        {/* Team Section - Commented out
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-lg mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              We're a passionate team of creators, developers, and community builders working to empower the next generation of digital creators.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TeamMember
                image="/team-member-1.jpg"
                name="Al"
                role="Founder & CEO"
              />
              <TeamMember
                image="/team-member-2.jpg"
                name="Sarah Chen"
                role="Head of Product"
              />
              <TeamMember
                image="/team-member-3.jpg"
                name="Marcus Kim"
                role="Lead Developer"
              />
            </div>
          </div>
        </div>
        */}
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
    <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TeamMember({ image, name, role }: { 
  image: string; 
  name: string; 
  role: string; 
}) {
  return (
    <div className="text-center">
      <div className="relative w-48 h-48 mx-auto mb-4">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover rounded-full"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
      <p className="text-gray-600">{role}</p>
    </div>
  );
}