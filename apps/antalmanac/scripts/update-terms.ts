import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { WebsocTerm } from '@packages/antalmanac-types';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TERMS_URL = 'https://anteaterapi.com/v2/rest/websoc/terms';
const COURSES_URL = 'https://anteaterapi.com/v2/rest/courses';
const OUTPUT_PATH = resolve(__dirname, '../src/generated/deployed_terms.json');

const BATCH_SIZE = 100;
const COURSE_COUNT_CHANGE_THRESHOLD = 10;

interface DeployedTermsData {
    latestTerm: string;
    courseCount: number;
    updatedAt?: string;
    reason?: string;
}

async function getCourseCount(headers: Record<string, string>): Promise<number> {
    console.log(`Checking course count from ${COURSES_URL}...`);

    let count = 0;

    for (let skip = 0; ; skip += BATCH_SIZE) {
        const res = await fetch(`${COURSES_URL}?take=${BATCH_SIZE}&skip=${skip}`, { headers });
        if (!res.ok) {
            throw new Error(`API error at skip=${skip}: ${res.status}`);
        }
        const json = (await res.json()) as { data: unknown[] };
        const batchSize = json.data?.length ?? 0;
        count += batchSize;

        if (batchSize < BATCH_SIZE) break;
    }

    return count;
}

async function updateTerms() {
    try {
        const apiKey = process.env.ANTEATER_API_KEY;
        if (!apiKey) throw new Error('ANTEATER_API_KEY is required');

        const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}` };

        console.log(`Fetching terms from ${TERMS_URL}...`);
        const termsRes = await fetch(TERMS_URL, { headers });

        if (!termsRes.ok) {
            throw new Error(`API returned ${termsRes.status}: ${termsRes.statusText}`);
        }

        const termsJson = (await termsRes.json()) as { data: WebsocTerm[] };
        const data = termsJson.data;

        if (!data || data.length === 0) {
            throw new Error('API returned empty term data');
        }

        const latestTerm = data[0].longName;
        const currentCount = await getCourseCount(headers);

        console.log(`Latest term from API: ${latestTerm}`);
        console.log(`Total courses from API: ${currentCount}`);

        let deployedData: DeployedTermsData = { latestTerm: '', courseCount: 0 };

        if (existsSync(OUTPUT_PATH)) {
            const currentFile = readFileSync(OUTPUT_PATH, 'utf-8');
            try {
                deployedData = JSON.parse(currentFile);
            } catch (e) {
                console.log('Error parsing existing deployed_terms.json, treating as empty.');
            }
            console.log(`Current deployed term: ${deployedData.latestTerm}`);
            console.log(`Current deployed course count: ${deployedData.courseCount}`);
        } else {
            console.log('No existing deployed_terms.json found.');
            mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
        }

        const termChanged = latestTerm !== deployedData.latestTerm;
        const countChanged = Math.abs(currentCount - deployedData.courseCount) > COURSE_COUNT_CHANGE_THRESHOLD;

        if (termChanged || countChanged) {
            console.log('Update needed! Updating file...');
            const reasons = [termChanged && 'New term detected', countChanged && 'Course count changed significantly']
                .filter(Boolean)
                .join('; ');

            const newData: DeployedTermsData = {
                latestTerm,
                courseCount: currentCount,
                updatedAt: new Date().toISOString(),
                reason: reasons,
            };
            writeFileSync(OUTPUT_PATH, JSON.stringify(newData, null, 2));
            console.log(`Updated ${OUTPUT_PATH}`);
        } else {
            console.log('Terms and course count are up to date. No changes needed.');
        }
    } catch (error) {
        console.error('Error updating terms:', error);
        process.exit(1);
    }
}

updateTerms();
