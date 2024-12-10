/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')].filter(Boolean),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
