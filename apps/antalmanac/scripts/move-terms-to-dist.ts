import { mkdir, rename, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    const sourceDir = join(__dirname, '../src/generated/terms');
    const distDir = join(__dirname, '../dist');
    const targetDir = join(distDir, 'terms');

    console.log(`Moving ${sourceDir} to ${targetDir}...`);

    try {
        await mkdir(distDir, { recursive: true });
        try {
            await stat(targetDir);
            await rm(targetDir, { recursive: true, force: true });
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw e;
            }
        }
        await rename(sourceDir, targetDir);
        console.log('Terms moved successfully.');
    } catch (error) {
        console.error('Error moving terms:', error);
        process.exit(1);
    }
}

main();
