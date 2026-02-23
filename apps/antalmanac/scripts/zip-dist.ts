import { createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import archiver from "archiver";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    const distDir = join(__dirname, "../dist");
    const zipPath = join(__dirname, "../dist.zip");

    console.log(`Zipping ${distDir} to ${zipPath}...`);

    try {
        const output = createWriteStream(zipPath);
        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        const archiveComplete = new Promise<void>((resolve, reject) => {
            output.on("close", () => {
                console.log(`Dist directory zipped successfully.`);
                resolve();
            });

            archive.on("error", (err: Error) => {
                reject(err);
            });
        });

        archive.pipe(output);
        archive.directory(distDir, false);
        await archive.finalize();
        await archiveComplete;
    } catch (error) {
        console.error("Error zipping dist directory:", error);
        process.exit(1);
    }
}

main();
