import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // TODO: Remove these ignores and fix the underlying issues
    typescript: {
        ignoreBuildErrors: true,
    },
    serverExternalPackages: ['@node-rs/argon2'],
    turbopack: {},
};

export default withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
})(nextConfig);
