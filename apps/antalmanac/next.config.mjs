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
    turbopack: {},
    async redirects() {
        return [
            {
                source: '/feedback',
                destination: 'https://form.asana.com/?k=VRhMN_PtqQVRZrixgbYIZA&d=1208267282546207',
                permanent: false,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/.well-known/apple-app-site-association',
                destination: '/apple-app-site-association',
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
