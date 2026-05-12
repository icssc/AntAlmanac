import { createWriteStream } from 'node:fs';

import archiver from 'archiver';

import { DIST_DIR, DIST_ZIP } from './lib/paths.js';

async function main() {
    const distDir = DIST_DIR;
    const zipPath = DIST_ZIP;

    console.log(`Zipping ${distDir} to ${zipPath}...`);

    try {
        const output = createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        const archiveComplete = new Promise<void>((resolve, reject) => {
            output.on('close', () => {
                console.log(`Dist directory zipped successfully.`);
                resolve();
            });

            archive.on('error', (err: Error) => {
                reject(err);
            });
        });

        archive.pipe(output);
        archive.directory(distDir, false);
        await archive.finalize();
        await archiveComplete;
    } catch (error) {
        console.error('Error zipping dist directory:', error);
        process.exit(1);
    }
}

main();
