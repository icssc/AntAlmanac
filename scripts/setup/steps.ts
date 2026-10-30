import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';

import {
    APP_ENV,
    DB_ENV,
    createEnvFiles,
    envProblems,
    isLocalDatabase,
    isPlaceholder,
    readEnv,
    redact,
    root,
    writeEnv,
} from './env';
import { getState, secret, update, updateStep } from './ui';

class Problem extends Error {
    constructor(
        message: string,
        readonly fix: string[] = [],
        readonly output: string[] = []
    ) {
        super(message);
    }
}

interface Options {
    check: boolean;
    interactive: boolean;
}

interface Step {
    id: string;
    label: string;
    needs?: string[];
    setupOnly?: boolean;
    run: (options: Options) => Promise<string>;
}

const tail = (text: string, lines: number) =>
    redact(stripVTControlCharacters(text))
        .split(/[\r\n]+/)
        .filter((line) => line.trim())
        .slice(-lines);

function run(command: string, args: string[], { env = {}, timeout = 0 } = {}) {
    const display = [command, ...args].join(' ');
    update({ command: display, output: [] });
    return new Promise<string>((resolve, reject) => {
        let output = '';
        const child = spawn(command, args, {
            cwd: root,
            env: { ...process.env, ...env },
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: process.platform === 'win32',
            timeout,
        });
        const collect = (chunk: Buffer) => {
            output = (output + chunk).slice(-20_000);
            update({ output: tail(output, 5) });
        };
        child.stdout.on('data', collect);
        child.stderr.on('data', collect);
        child.on('error', (error) => reject(new Problem(`Could not run ${command}: ${error.message}`)));
        child.on('close', (code) => {
            if (code === 0) return resolve(output);
            const reason = code === null ? 'timed out' : `exited with code ${code}`;
            reject(new Problem(`\`${display}\` ${reason}.`, [], tail(output, 8)));
        });
    });
}

/** Rethrows a failed command as a friendlier problem that keeps the command output. */
const fail =
    (message: string, ...fix: string[]) =>
    (error: Problem): never => {
        throw new Problem(message, fix, error.output);
    };

const platform = (advice: Partial<Record<NodeJS.Platform, string>> & { linux: string }) =>
    advice[process.platform] ?? advice.linux;

const INSTALL_DOCKER = platform({
    darwin: 'Install OrbStack from https://orbstack.dev/ and open it.',
    win32: 'Install Docker Desktop from https://www.docker.com/products/docker-desktop/ and open it.',
    linux: 'Install Docker with: curl -fsSL https://get.docker.com | sudo sh',
});
const START_DOCKER = platform({
    darwin: 'Open OrbStack and wait until Docker is running.',
    win32: 'Open Docker Desktop and wait until Docker is running.',
    linux: 'Start Docker with: sudo systemctl start docker',
});
const API_KEY_HELP = [
    'Create a secret key at https://dashboard.anteaterapi.com/',
    'Sign in with ICSSC. If you are not signed in, use your UCI Google account at https://antalmanac.com first.',
];

const askApiKey = async (reason: string) => (await secret('Anteater API key', [reason, ...API_KEY_HELP])).trim();

const psql = (database: string, sql: string) =>
    run('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', database, '-tAc', sql]);

function hasData(file: string) {
    try {
        const value = JSON.parse(
            readFileSync(join(root, 'apps/antalmanac-scheduler/site/src/generated', file), 'utf8')
        );
        return Object.keys(file === 'searchData.json' ? value.courses : value).length > 0;
    } catch {
        return false;
    }
}

const STEPS: Step[] = [
    {
        id: 'tools',
        label: 'Node & pnpm',
        async run() {
            const node = readFileSync(join(root, '.nvmrc'), 'utf8').trim();
            const pnpm = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).packageManager.split('@')[1];
            const fix = 'Run mise install, then run setup again.';
            if (process.versions.node.split('.')[0] !== node) {
                throw new Problem(`Node ${node} is required, but Node ${process.versions.node} is active.`, [fix]);
            }
            const active = (await run('pnpm', ['--version'])).trim().split('\n').at(-1);
            if (active !== pnpm) throw new Problem(`pnpm ${pnpm} is required, but pnpm ${active} is active.`, [fix]);
            return `Node ${process.versions.node} · pnpm ${active}`;
        },
    },
    {
        id: 'dependencies',
        label: 'Workspace dependencies',
        async run() {
            const missing = [
                'apps/antalmanac/node_modules/next/package.json',
                'apps/antalmanac-scheduler/db/node_modules/drizzle-kit/package.json',
                'apps/antalmanac-planner/api/node_modules/drizzle-kit/package.json',
                'packages/anteater-api/src/types/generated/anteater-api-types.ts',
            ].filter((file) => !existsSync(join(root, file)));
            if (missing.length) {
                throw new Problem(
                    'Some workspace packages are missing.',
                    ['Run pnpm install --frozen-lockfile'],
                    missing
                );
            }
            return 'Packages and generated API types are installed.';
        },
    },
    {
        id: 'environment',
        label: 'Environment files & credentials',
        async run({ check }) {
            if (!check) createEnvFiles(process.env.ANTEATER_API_KEY);
            const problems = envProblems();
            if (!problems.length) return `${APP_ENV} is ready.`;
            if (problems.length === 1) throw new Problem(problems[0]);
            throw new Problem(`${problems.length} settings need attention.`, problems);
        },
    },
    {
        id: 'database',
        label: 'PostgreSQL (Docker)',
        needs: ['environment'],
        async run({ check }) {
            const app = readEnv(APP_ENV);
            if (app.STAGE !== 'local') throw new Problem(`Set STAGE=local in ${APP_ENV}.`);
            if (
                !isLocalDatabase(app.DB_URL, 'antalmanac') ||
                !isLocalDatabase(app.PLANNER_DATABASE_URL, 'planner') ||
                app.DB_URL !== readEnv(DB_ENV).DB_URL
            ) {
                throw new Problem('Setup only manages the local Docker database, and your .env points elsewhere.', [
                    `Copy DB_URL and PLANNER_DATABASE_URL from ${APP_ENV}.example into ${APP_ENV} and ${DB_ENV}.`,
                    'Or migrate your own database with pnpm sched:db:migrate and pnpm plan:db:migrate.',
                ]);
            }
            await run('docker', ['--version']).catch(fail('Docker is not installed.', INSTALL_DOCKER));
            await run('docker', ['compose', 'version']).catch(fail('Docker Compose is not installed.', INSTALL_DOCKER));
            await run('docker', ['info'], { timeout: 20_000 }).catch((error: Problem) =>
                error.output.join('\n').includes('permission denied')
                    ? fail(
                          'Your user cannot access Docker.',
                          'Run: sudo usermod -aG docker $USER, then log in again.'
                      )(error)
                    : fail('Docker is installed, but it is not running.', START_DOCKER)(error)
            );
            if (!check) {
                await run('docker', ['compose', 'up', '-d', '--wait', '--wait-timeout', '120', 'db']).catch(
                    fail('PostgreSQL did not start.', 'If another Postgres server is using port 5432, stop it.')
                );
                if (!(await psql('postgres', "SELECT 1 FROM pg_database WHERE datname = 'planner'")).trim()) {
                    await psql('postgres', 'CREATE DATABASE planner');
                }
            }
            await psql('planner', 'SELECT 1').catch(
                fail('The local database is not running.', 'Start it with pnpm db:start, or run setup.')
            );
            return 'Scheduler and planner databases are accepting connections.';
        },
    },
    {
        id: 'migrations',
        label: 'Database schemas',
        needs: ['dependencies', 'database'],
        setupOnly: true,
        async run() {
            await run('pnpm', ['sched:db:migrate'], { env: { DB_URL: readEnv(DB_ENV).DB_URL } });
            await run('pnpm', ['plan:db:migrate'], {
                env: { PLANNER_DATABASE_URL: readEnv(APP_ENV).PLANNER_DATABASE_URL },
            });
            return 'Scheduler and planner schemas are up to date.';
        },
    },
    {
        id: 'data',
        label: 'Course & term data',
        needs: ['dependencies'],
        async run({ check, interactive }) {
            const askForKey = async (reason: string) => {
                const key = interactive && !check ? await askApiKey(reason) : '';
                if (key) writeEnv(APP_ENV, { ANTEATER_API_KEY: key }, true);
                return key;
            };
            let key = readEnv(APP_ENV).ANTEATER_API_KEY;
            if (isPlaceholder(key)) key = await askForKey('Setup uses this key to download course data.');
            if (isPlaceholder(key)) throw new Problem(`Set ANTEATER_API_KEY in ${APP_ENV}.`, API_KEY_HELP);
            while (!check) {
                try {
                    await run('pnpm', ['get-data'], { env: { ANTEATER_API_KEY: key } });
                    break;
                } catch (error) {
                    const reason = 'Course data could not be downloaded. Your API key may be invalid.';
                    key = await askForKey(reason);
                    if (!key) {
                        fail(reason, `Set a valid ANTEATER_API_KEY in ${APP_ENV}.`, ...API_KEY_HELP)(error as Problem);
                    }
                }
            }
            const missing = ['termData.json', 'departments.json', 'searchData.json'].filter((file) => !hasData(file));
            if (!missing.length) return 'Course search, departments, and terms are generated.';
            throw new Problem(`Course data is missing: ${missing.join(', ')}.`, [
                check ? 'Run setup to download it.' : `Check ANTEATER_API_KEY in ${APP_ENV}, then run setup again.`,
            ]);
        },
    },
];

export function resetSteps(check: boolean) {
    update({
        steps: STEPS.filter((step) => !(check && step.setupOnly)).map(({ id, label }) => ({
            id,
            label,
            status: 'pending',
        })),
    });
}

/** Runs every step that has not finished yet and reports whether all of them are done. */
export async function runSteps(options: Options) {
    for (const step of STEPS) {
        const current = getState().steps.find(({ id }) => id === step.id);
        if (!current || current.status === 'done') continue;
        const blocker = getState().steps.find(({ id, status }) => step.needs?.includes(id) && status !== 'done');
        if (blocker) {
            updateStep(step.id, { status: 'skipped', detail: `Waiting on ${blocker.label}.` });
            continue;
        }
        updateStep(step.id, { status: 'running', detail: undefined, fix: [], output: [] });
        try {
            updateStep(step.id, { status: 'done', detail: await step.run(options) });
        } catch (error) {
            const problem = error instanceof Problem ? error : new Problem(String(error));
            updateStep(step.id, {
                status: 'failed',
                detail: problem.message,
                fix: problem.fix,
                output: problem.output,
            });
        }
        update({ command: undefined, output: [] });
    }
    return getState().steps.every(({ status }) => status === 'done');
}
