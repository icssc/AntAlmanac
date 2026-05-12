import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';

import { createClient } from '@packages/anteater-api/client';
import type { WebsocAPIDepartmentsResponse } from '@packages/anteater-api/types';

import { DEPARTMENTS_FILE, GENERATED_DIR } from './lib/paths.js';

const DEPARTMENT_YEAR_RANGE = 10;

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

async function main() {
    const sinceYear = String(new Date().getFullYear() - DEPARTMENT_YEAR_RANGE);

    console.log('Fetching departments from Anteater API...');
    const departments = await aapiClient.websoc.getDepartments({ sinceYear });

    console.log(`Fetched ${departments.length} departments.`);

    const departmentMap = Object.fromEntries(
        departments.map((dept: WebsocAPIDepartmentsResponse[number]) => [
            dept.deptCode,
            `${dept.deptCode}: ${dept.deptName}`,
        ])
    );

    await mkdir(GENERATED_DIR, { recursive: true });
    await writeFile(DEPARTMENTS_FILE, JSON.stringify(departmentMap, null, 2));

    console.log(`Departments written to ${DEPARTMENTS_FILE}`);
}

main();
