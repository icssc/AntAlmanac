import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    serverExternalPackages: ['@node-rs/argon2'],
    transpilePackages: ['@peterportal/site', '@peterportal/api'],
    turbopack: {},
    async redirects() {
        return [
            {
                source: '/planner/roadmap',
                destination: '/planner',
                permanent: true,
            },
            {
                source: '/planner/professor/:id',
                destination: '/planner/instructor/:id',
                permanent: true,
            },
        ];
    },
};

export default withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
})(nextConfig);
