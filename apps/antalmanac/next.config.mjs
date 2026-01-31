import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['@node-rs/argon2'],
    turbopack: {},
};

export default withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
})(nextConfig);
