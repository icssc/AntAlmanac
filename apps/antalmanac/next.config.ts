import './src/env';
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
        // TODO: Remove this once Next.js/Opennext fixes image optimization
        unoptimized: true,
    },
    turbopack: {},
    experimental: {
        optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/system', '@mui/x-date-pickers'],
    },
    async redirects() {
        return [
            {
                source: '/auth',
                destination: '/api/auth/oauth2/callback/icssc',
                permanent: false,
            },
        ];
    },
    async rewrites() {
        return [
            // Apple's Associated Domains verifier fetches the AASA from this
            // exact path (no extension). Route the request to the Next.js
            // handler at src/app/apple-app-site-association/route.ts, which
            // emits the file with Content-Type: application/json.
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
