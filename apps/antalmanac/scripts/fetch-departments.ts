import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { WebsocDepartmentsAPIResult } from '@packages/antalmanac-types';

import { fetchAnteaterAPI } from '../src/backend/lib/helpers';

import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEPARTMENT_YEAR_RANGE = 10;
const OUTPUT_DIR = join(__dirname, '../src/generated/');
const OUTPUT_FILE = join(OUTPUT_DIR, 'departments.json');

async function main() {
    const minYear = new Date().getFullYear() - DEPARTMENT_YEAR_RANGE;
    const url = `https://anteaterapi.com/v2/rest/websoc/departments?since=${minYear}`;

    console.log('Fetching departments from Anteater API...');
    const data = await fetchAnteaterAPI<WebsocDepartmentsAPIResult>(url, { isApiKeyRequired: true });

    if (!data?.data) {
        throw new Error('Departments API returned no data');
    }

    const departments = data.data;
    console.log(`Fetched ${departments.length} departments.`);

    const departmentMap = Object.fromEntries(
        departments.map((dept) => [dept.deptCode, `${dept.deptCode}: ${dept.deptName}`])
    );

    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(OUTPUT_FILE, JSON.stringify(departmentMap, null, 2));

    console.log(`Departments written to ${OUTPUT_FILE}`);
}

main();
