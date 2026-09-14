/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-coral-delta-60.vercel.app/api/v1';
    const backendOrigin = new URL(backendUrl).origin;

    return [
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
