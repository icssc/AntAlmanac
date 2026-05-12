import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@packages/anteater-api/client';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEPARTMENT_YEAR_RANGE = 10;
const OUTPUT_DIR = join(__dirname, '../src/generated/');
const OUTPUT_FILE = join(OUTPUT_DIR, 'departments.json');

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

async function main() {
    const sinceYear = String(new Date().getFullYear() - DEPARTMENT_YEAR_RANGE);

    console.log('Fetching departments from Anteater API...');
    const departments = await aapiClient.websoc.getDepartments({ sinceYear });

    console.log(`Fetched ${departments.length} departments.`);

    const departmentMap = Object.fromEntries(
        departments.map((dept) => [dept.deptCode, `${dept.deptCode}: ${dept.deptName}`])
    );

    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(OUTPUT_FILE, JSON.stringify(departmentMap, null, 2));

    console.log(`Departments written to ${OUTPUT_FILE}`);
}

main();
