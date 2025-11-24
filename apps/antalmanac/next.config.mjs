import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    //swSrc: 'pwa/sw.js',
    disable: process.env.NODE_ENV === 'development',
})(nextConfig);
