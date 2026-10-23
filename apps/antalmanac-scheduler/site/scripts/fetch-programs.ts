import { mkdir, writeFile } from 'node:fs/promises';

import { GENERATED_DIR, MAJORS_FILE } from '$lib/paths';
import { env } from '$scripts/env';
import { createClient } from '@packages/anteater-api/client';
import type { MajorsAPIResponse } from '@packages/anteater-api/types';

const aapiClient = createClient({ apiKey: env.ANTEATER_API_KEY });

async function main() {
    console.log('Fetching majors from Anteater API...');
    const majors = await aapiClient.programs.getMajors();

    console.log(`Fetched ${majors.length} majors.`);

    const majorMap = Object.fromEntries(
        majors.map((major: MajorsAPIResponse[number]) => [major.id, `${major.id}: ${major.name}`])
    );

    await mkdir(GENERATED_DIR, { recursive: true });
    await writeFile(MAJORS_FILE, JSON.stringify(majorMap, null, 2));

    console.log(`Majors written to ${MAJORS_FILE}`);
}

main();
