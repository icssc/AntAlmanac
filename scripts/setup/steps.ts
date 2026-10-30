import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { AAPIError, createClient } from '@packages/anteater-api/client';

import { SetupError, readEnv, run } from './helpers';
import type { SetupStep } from './types';

const APP_ENV = 'apps/antalmanac/.env';
const DB_ENV = 'apps/antalmanac-scheduler/db/.env';
const PLACEHOLDER = 'replace-me';

const COURSE_DATA_FILES = [
    'apps/antalmanac-scheduler/site/src/generated/termData.json',
    'apps/antalmanac-scheduler/site/src/generated/searchData.json',
];

const API_KEY_HELP = 'Create a secret key at https://dashboard.anteaterapi.com (sign in with your UCI Google account).';

const DOCKER_INSTALL_HELP: Partial<Record<NodeJS.Platform, string>> = {
    darwin: 'Install OrbStack from https://orbstack.dev and open it.',
    win32: 'Install Docker Desktop from https://www.docker.com/products/docker-desktop and open it.',
    linux: 'Install Docker with: curl -fsSL https://get.docker.com | sudo sh',
};

const DOCKER_START_HELP: Partial<Record<NodeJS.Platform, string>> = {
    darwin: 'Open OrbStack and wait until Docker is running.',
    win32: 'Open Docker Desktop and wait until Docker is running.',
    linux: 'Start Docker with: sudo systemctl start docker',
};

async function checkNode() {
    const requiredVersion = readFileSync('.nvmrc', 'utf8').trim();

    if (!process.version.startsWith(`v${requiredVersion}.`)) {
        throw new SetupError(
            `Node ${requiredVersion} is required, but you are using Node ${process.version}.`,
            'Run mise install, then try again.'
        );
    }

    return `Node ${process.version}`;
}

async function installDependencies() {
    await run('pnpm install --frozen-lockfile', 'Dependencies could not be installed.');

    return 'Dependencies are installed.';
}

async function createEnvFiles() {
    for (const path of [APP_ENV, DB_ENV]) {
        if (!existsSync(path)) {
            const example = readFileSync(`${path}.example`, 'utf8');
            const env = example.replaceAll(
                `_SECRET=${PLACEHOLDER}`,
                () => `_SECRET=${randomBytes(32).toString('hex')}`
            );
            writeFileSync(path, env);
        }

        const env = readEnv(path);
        const missingKeys = Object.keys(readEnv(`${path}.example`)).filter((key) => !env[key]);

        if (missingKeys.length > 0) {
            throw new SetupError(`${path} is missing ${missingKeys.join(', ')}.`, `Copy them from ${path}.example.`);
        }
    }

    return 'Environment files are ready.';
}

async function checkDocker() {
    await run('docker --version', 'Docker is not installed.', DOCKER_INSTALL_HELP[process.platform]);
    await run('docker info', 'Could not connect to Docker.', DOCKER_START_HELP[process.platform]);

    return 'Docker is running.';
}

async function startDatabase() {
    await run('docker compose up --detach --wait db', 'The database did not start.', 'Make sure port 5432 is free.');

    const databases = await run(
        'docker compose exec -T db psql -U postgres -tAc "SELECT datname FROM pg_database"',
        'Could not list the databases.'
    );

    if (!databases.split('\n').includes('planner')) {
        await run('docker compose exec -T db createdb -U postgres planner', 'Could not create the planner database.');
    }

    return 'PostgreSQL is running.';
}

async function migrateDatabases() {
    await run('pnpm sched:db:migrate', 'Scheduler migrations failed.');
    await run('pnpm plan:db:migrate', 'Planner migrations failed.');

    return 'Scheduler and Planner schemas are up to date.';
}

async function checkApiKey() {
    const { ANTEATER_API_KEY } = readEnv(APP_ENV);

    if (!ANTEATER_API_KEY || ANTEATER_API_KEY === PLACEHOLDER) {
        throw new SetupError('Your Anteater API key is missing.', API_KEY_HELP);
    }

    try {
        await createClient({ apiKey: ANTEATER_API_KEY }).websoc.getTerms();
    } catch (error) {
        if (error instanceof AAPIError && error.status === 401) {
            throw new SetupError('Your Anteater API key is invalid or expired.', API_KEY_HELP);
        }
        throw error;
    }

    return 'Anteater API key is valid.';
}

function saveApiKey(key: string) {
    const env = readFileSync(APP_ENV, 'utf8');
    writeFileSync(
        APP_ENV,
        env.replace(/^ANTEATER_API_KEY=.*$/m, () => `ANTEATER_API_KEY=${key}`)
    );
}

async function downloadCourseData() {
    if (COURSE_DATA_FILES.every((file) => existsSync(file))) {
        return 'Course data is already downloaded.';
    }

    await run('pnpm get-data', 'Course data could not be downloaded.', `Check ANTEATER_API_KEY in ${APP_ENV}.`);

    return 'Course data is downloaded.';
}

export const STEPS: SetupStep[] = [
    { label: 'Node.js', run: checkNode },
    { label: 'Dependencies', run: installDependencies },
    { label: 'Environment files', run: createEnvFiles },
    { label: 'Docker', run: checkDocker, skippable: true },
    { label: 'Database', run: startDatabase, needsPreviousStep: true },
    { label: 'Migrations', run: migrateDatabases, needsPreviousStep: true },
    {
        label: 'Anteater API key',
        run: checkApiKey,
        prompt: {
            message: 'Paste your Anteater API key',
            note: `Stored only in ${APP_ENV}.`,
            onSubmit: saveApiKey,
        },
    },
    { label: 'Course data', run: downloadCourseData },
];
