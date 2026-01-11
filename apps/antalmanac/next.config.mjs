/** @type {import('next').NextConfig} */
const nextConfig = {
    // TODO: Remove these ignores and fix the underlying issues
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
    },
    serverExternalPackages: ['@node-rs/argon2'],
};

export default nextConfig;
