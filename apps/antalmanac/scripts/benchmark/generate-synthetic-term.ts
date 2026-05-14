/**
 * Generates a synthetic term JSON file mirroring the structure produced by
 * `parseSectionCodes` in `src/backend/lib/term-section-codes.ts`.
 *
 * Used solely by the benchmark for the search router term-data caching change.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { GENERATED_TERMS_DIR } from '../lib/paths.js';

// Roughly matches the latest UCI term: see deployed_terms.json (sectionCount).
const TARGET_SECTION_COUNT = 12_804;

const DEPARTMENTS = [
    'COMPSCI',
    'I&C SCI',
    'IN4MATX',
    'STATS',
    'MATH',
    'PHYSICS',
    'CHEM',
    'BIO SCI',
    'EARTHSS',
    'ECON',
    'PSYCH',
    'SOC SCI',
    'POL SCI',
    'HISTORY',
    'ENGLISH',
    'PHILOS',
    'MUSIC',
    'DRAMA',
    'ART',
    'DANCE',
    'ENGRMSE',
    'ENGRCEE',
    'EECS',
    'BME',
    'CHEM ENG',
    'MAE',
    'NETSYS',
    'ARABIC',
    'CHINESE',
    'FRENCH',
    'GERMAN',
    'JAPANSE',
    'KOREAN',
    'SPANISH',
    'EDUC',
    'PUBHLTH',
    'NUR SCI',
    'PHRMSCI',
    'LAW',
    'MGMT',
    'WRITING',
    'CLASSIC',
    'HUMAN',
    'GLBLCLT',
    'GEN&SEX',
];

const SECTION_TYPES = ['Lec', 'Dis', 'Lab', 'Sem', 'Tut'];

function pad(n: number, width: number) {
    return n.toString().padStart(width, '0');
}

async function main() {
    await mkdir(GENERATED_TERMS_DIR, { recursive: true });

    const result: Record<
        string,
        {
            type: 'SECTION';
            department: string;
            courseNumber: string;
            sectionCode: string;
            sectionNum: string;
            sectionType: string;
        }
    > = {};

    let i = 0;
    let sectionCodeNum = 10000;
    while (i < TARGET_SECTION_COUNT) {
        const dept = DEPARTMENTS[i % DEPARTMENTS.length];
        const courseNumber = String(((i * 37) % 290) + 10);
        const sectionCode = pad(sectionCodeNum++, 5);
        const sectionType = SECTION_TYPES[i % SECTION_TYPES.length];
        const sectionNum = pad((i % 30) + 1, 2);

        result[sectionCode] = {
            type: 'SECTION',
            department: dept,
            courseNumber,
            sectionCode,
            sectionNum,
            sectionType,
        };
        i++;
    }

    // Match the production `Fall_2026.json` shape exactly so the test exercises
    // the same code path as production traffic.
    // Naming matches production: `${quarter}_${year}.json`. The benchmark uses
    // term "BENCHMARK 2099" (year BENCHMARK, quarter 2099) so we never collide
    // with a real term file.
    const filePath = join(GENERATED_TERMS_DIR, '2099_BENCHMARK.json');
    await writeFile(filePath, JSON.stringify(result, null, 2));

    console.log(`Wrote ${Object.keys(result).length} synthetic sections to ${filePath}`);
}

main();
