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
        external: ['crypto'],
    });
}

main();
