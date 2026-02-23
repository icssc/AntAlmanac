import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    const sourceDir = join(__dirname, "../src/generated/terms");
    const targetDir = join(__dirname, "../dist/terms");

    console.log(`Moving terms from ${sourceDir} to ${targetDir}...`);

    try {
        await mkdir(join(__dirname, "../dist"), { recursive: true });
        await mkdir(targetDir, { recursive: true });
        await cp(sourceDir, targetDir, { recursive: true });
        await rm(sourceDir, { recursive: true, force: true });

        console.log("Terms moved successfully.");
    } catch (error) {
        console.error("Error moving terms:", error);
        process.exit(1);
    }
}

main();
