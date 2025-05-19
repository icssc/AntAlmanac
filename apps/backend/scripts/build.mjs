import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    await build({
        bundle: true,
        minify: true,
        platform: 'node',
        outdir: 'dist',
        entryPoints: {
            lambda: 'src/lambda.ts',
        },
        alias: {
            $aa: join(__dirname, '../../antalmanac'),
            $db: join(__dirname, '../src/db'),
            $generated: join(__dirname, '../src/generated'),
            $lib: join(__dirname, '../src/lib'),
            $models: join(__dirname, '../src/models'),
        },
    });
}

main();
