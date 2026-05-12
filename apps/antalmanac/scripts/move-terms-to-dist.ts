import { mkdir, rename, rm, stat } from 'node:fs/promises';

import { DIST_DIR, DIST_TERMS_DIR, GENERATED_TERMS_DIR } from './lib/paths.js';

async function main() {
    const sourceDir = GENERATED_TERMS_DIR;
    const distDir = DIST_DIR;
    const targetDir = DIST_TERMS_DIR;

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
