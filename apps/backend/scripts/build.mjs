import { build } from 'esbuild';

async function main() {
    await build({
        bundle: true,
        minify: true,
        platform: 'node',
        target: 'node20',
        format: 'cjs',
        outdir: 'dist',
        entryPoints: {
            lambda: 'src/lambda.ts',
        },
        external: [
            // Node.js built-in modules
            'crypto',
            'fs',
            'path',
            'http',
            'https',
            'stream',
            'util',
            'zlib',
            'url',
            'buffer',
            'events',
            'querystring',
            'net',
            'tls',
            'os',
            'child_process',
            // AWS SDK is available in Lambda runtime
            '@aws-sdk/*',
        ],
    });
}

main();
