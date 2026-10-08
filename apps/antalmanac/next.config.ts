import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    logging: {
        // Dev logs include the full tRPC input. Page navigations stay visible.
        incomingRequests: {
            ignore: [/^\/api\//, /^\/planner\/api\//],
        },
        // Browser warnings stay in the browser console. Errors still reach the terminal.
        browserToTerminal: 'error',
    },
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
    outputFileTracingIncludes: {
        '/*': ['../antalmanac-scheduler/site/src/generated/**/*'],
    },
    async redirects() {
        return [
            {
                source: '/auth',
                destination: '/api/auth/oauth2/callback/icssc',
                permanent: false,
            },
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

export default nextConfig;
