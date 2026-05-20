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
            // Android's Intent Filter Verifier fetches the Digital Asset
            // Links file from this exact path. Route to the Next.js handler
            // at src/app/assetlinks.json/route.ts, which emits the file with
            // Content-Type: application/json.
            {
                source: '/.well-known/assetlinks.json',
                destination: '/assetlinks.json',
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
