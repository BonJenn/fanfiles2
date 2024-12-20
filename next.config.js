/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', ''),
      `${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`
    ].filter(Boolean),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
