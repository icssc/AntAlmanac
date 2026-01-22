/** @type {import('next').NextConfig} */
const nextConfig = {
    // TODO: Remove these ignores and fix the underlying issues
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    serverExternalPackages: ['@node-rs/argon2'],
};

export default nextConfig;
