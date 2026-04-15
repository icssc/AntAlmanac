/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: '/planner',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/planner/api/:path*',
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/planner',
        basePath: false,
        permanent: true,
      },
      {
        source: '/roadmap',
        destination: '/',
        permanent: true,
      },
      {
        source: '/professor/:id',
        destination: '/instructor/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
