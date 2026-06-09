import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { GENERATED_DIR } from './lib/paths.js';

const APP_ROOT = join(import.meta.dirname, '..');
const ANALYZE_CHUNKS_DIR = join(APP_ROOT, '.next/diagnostics/analyze/_next/static/chunks');
const BASELINE_FILE = join(APP_ROOT, 'bundle-baselines/main.json');

interface ChunkEntry {
    name: string;
    bytes: number;
    kilobytes: number;
}

interface BundleBaseline {
    capturedAt: string;
    analyzer: 'next-experimental-analyze';
    nextVersion: string;
    chunks: ChunkEntry[];
    summary: {
        chunkCount: number;
        totalBytes: number;
        totalKilobytes: number;
        largestChunk: ChunkEntry;
    };
}

async function listChunkSizes(directory: string): Promise<ChunkEntry[]> {
    let files: string[];
    try {
        files = await readdir(directory);
    } catch {
        throw new Error(
            `No analyze output found at ${directory}. Run "pnpm analyze:baseline" first (requires generated term/search data).`
        );
    }

    const chunks: ChunkEntry[] = [];

    for (const file of files) {
        if (!file.endsWith('.js')) {
            continue;
        }

        const filePath = join(directory, file);
        const fileStat = await stat(filePath);
        chunks.push({
            name: file,
            bytes: fileStat.size,
            kilobytes: Number((fileStat.size / 1024).toFixed(1)),
        });
    }

    return chunks.sort((a, b) => b.bytes - a.bytes);
}

async function readPackageVersion(): Promise<string> {
    const packageJson = JSON.parse(await readFile(join(APP_ROOT, 'package.json'), 'utf8')) as {
        dependencies?: { next?: string };
    };
    return packageJson.dependencies?.next ?? 'unknown';
}

async function buildBaseline(): Promise<BundleBaseline> {
    const chunks = await listChunkSizes(ANALYZE_CHUNKS_DIR);
    const totalBytes = chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);

    return {
        capturedAt: new Date().toISOString().slice(0, 10),
        analyzer: 'next-experimental-analyze',
        nextVersion: await readPackageVersion(),
        chunks,
        summary: {
            chunkCount: chunks.length,
            totalBytes,
            totalKilobytes: Number((totalBytes / 1024).toFixed(1)),
            largestChunk: chunks[0],
        },
    };
}

function printBaseline(baseline: BundleBaseline) {
    console.log(`Bundle baseline (${baseline.analyzer}, Next ${baseline.nextVersion})`);
    console.log(`Captured: ${baseline.capturedAt}`);
    console.log(`Client chunks: ${baseline.summary.chunkCount} files, ${baseline.summary.totalKilobytes} KiB total`);
    console.log(
        `Largest chunk: ${baseline.summary.largestChunk.name} (${baseline.summary.largestChunk.kilobytes} KiB)`
    );
    console.log('');
    console.log('Top chunks:');

    for (const chunk of baseline.chunks.slice(0, 10)) {
        console.log(`  ${chunk.kilobytes.toString().padStart(7)} KiB  ${chunk.name}`);
    }
}

async function assertGeneratedDataPresent() {
    const requiredFiles = ['termData.json', 'searchData.json'];
    const missing = [];

    for (const file of requiredFiles) {
        try {
            await stat(join(GENERATED_DIR, file));
        } catch {
            missing.push(file);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing generated data: ${missing.join(', ')}. Run "pnpm get-data" with ANTEATER_API_KEY before analyze:baseline.`
        );
    }
}

async function main() {
    const shouldWrite = process.argv.includes('--write');

    if (shouldWrite) {
        await assertGeneratedDataPresent();
    }

    const baseline = await buildBaseline();
    printBaseline(baseline);

    if (shouldWrite) {
        await mkdir(join(APP_ROOT, 'bundle-baselines'), { recursive: true });
        await writeFile(BASELINE_FILE, `${JSON.stringify(baseline, null, 2)}\n`);
        console.log('');
        console.log(`Wrote ${BASELINE_FILE}`);
    }
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
