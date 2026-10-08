#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    APP_ENV,
    DB_ENV,
    DEPENDENCY_MARKERS,
    configureEnvironment,
    databaseProblem,
    environmentProblems,
    generatedDataProblems,
    isPlaceholder,
    plannerDatabaseProblem,
    prepareRetry,
    readEnv,
    redact,
    run,
} from './setup/core.mjs';
import { Terminal } from './setup/ui.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = new Set(process.argv.slice(2));
const allowed = new Set(['--yes', '--check', '--plain', '--help']);
if (args.has('--help')) {
    console.log(
        `AntAlmanac developer setup\n\n  mise run setup                  Recommended: managed toolchain + TUI\n  node scripts/setup.mjs           Interactive setup wizard\n  node scripts/setup.mjs --yes     Run setup without prompts\n  node scripts/setup.mjs --check   Read-only environment diagnosis\n  node scripts/setup.mjs --plain   Disable animation and color\n\nRequires Node ${readFileSync(join(root, '.nvmrc'), 'utf8').trim()}. Run from any directory.\nSetup installs pinned dependencies, prepares .env files, starts the local\nDocker database (scheduler + planner), applies migrations, and fetches course data.\nProvide ANTEATER_API_KEY through the environment, .env, or the masked prompt.\nExisting credentials are preserved. Missing prerequisites exit with code 1.\nCtrl+C exits with code 130; completed steps are safe to rerun.`
    );
    process.exit(0);
}
if ([...args].some((arg) => !allowed.has(arg))) {
    console.error('Unknown option. Run node scripts/setup.mjs --help.');
    process.exit(1);
}

const ui = new Terminal({ plain: args.has('--plain') });
const abort = new AbortController();
let interrupted = false;
let closed = false;
let pnpm = ['pnpm', []];
const managed = process.env.ANTALMANAC_TOOLCHAIN === 'mise';
const setupCommand = managed ? 'mise run setup' : 'node scripts/setup.mjs';
let devCommand = managed ? 'mise run dev' : 'pnpm dev';
let previousEnvironment;
let secrets = [];
let doctor = args.has('--check');
const steps = [
    ['tools', 'Node & package manager'],
    ['dependencies', 'Workspace dependencies'],
    ['environment', 'Local environment & credentials'],
    ['database', 'PostgreSQL'],
    ['migrations', 'Scheduler & planner schema'],
    ['data', 'Course & term data'],
    ['ready', 'Development readiness'],
].map(([id, label]) => ({ id, label, status: 'pending' }));
ui.steps = steps;
const step = (id) => steps.find((item) => item.id === id);
const okay = (id) => step(id).status === 'done';
const mark = (id, status, detail) => ui.status(step(id), status, detail && redact(detail, secrets));
function close() {
    if (!closed) {
        closed = true;
        ui.close();
    }
}
function cancel() {
    interrupted = true;
    abort.abort();
    close();
    console.log(`\nSetup stopped. Completed steps are kept; rerun ${setupCommand} to continue.`);
    // Give the process runner time to terminate children, including its SIGKILL fallback.
    setTimeout(() => process.exit(130), 2500);
}
process.once('SIGINT', cancel);
process.once('SIGTERM', cancel);
process.once('exit', close);

function captureSecrets(app, db) {
    secrets = [
        ...secrets,
        ...Object.entries({ ...app, ...db })
            .filter(([key]) => /KEY|SECRET|TOKEN|DB_URL/.test(key))
            .map(([, value]) => value),
    ];
}

async function command(cmd, argv, options = {}) {
    if (interrupted) throw new Error('Setup cancelled.');
    ui.command = [cmd, ...argv].join(' ');
    const result = await run(cmd, argv, {
        cwd: root,
        signal: abort.signal,
        onOutput: (output) => ui.output(redact(output, secrets)),
        ...options,
    });
    if (!result.ok) {
        const reason = result.timedOut ? 'Command timed out.' : result.error || `Command exited ${result.code}.`;
        throw new Error(`${reason}\n${redact(result.output, secrets).trim().split('\n').slice(-8).join('\n')}`);
    }
    return result.output.trim();
}
const pm = (argv, options) => command(pnpm[0], [...pnpm[1], ...argv], options);

async function task(id, action) {
    if (interrupted) throw new Error('Setup cancelled.');
    if (step(id).status === 'done') return;
    mark(id, 'running');
    try {
        await action();
    } catch (error) {
        if (interrupted) throw error;
        const recovery = {
            tools: 'Run mise install, then mise run setup.',
            dependencies: 'Check your network connection, then retry the dependency install.',
            environment: 'Review apps/antalmanac/.env and apps/antalmanac-scheduler/db/.env, then retry.',
            database: 'Start Docker Desktop or your Docker daemon. Check port 5432, then retry.',
            migrations: 'Inspect the migration error above. Fix the local database and retry; do not delete its data.',
            data: 'Check ANTEATER_API_KEY in apps/antalmanac/.env and your network connection, then retry.',
        };
        mark(id, 'failed', `${error.message}\n\nNext: ${recovery[id] || 'Fix the reported issue and retry.'}`);
    }
}

async function ensurePlannerDatabase() {
    const listed = await command('docker', [
        'compose',
        'exec',
        '-T',
        'db',
        'psql',
        '-U',
        'postgres',
        '-d',
        'postgres',
        '-tAc',
        "SELECT 1 FROM pg_database WHERE datname = 'planner'",
    ]);
    if (!listed.split('\n').some((line) => line.trim() === '1')) {
        await command('docker', [
            'compose',
            'exec',
            '-T',
            'db',
            'psql',
            '-U',
            'postgres',
            '-d',
            'postgres',
            '-c',
            'CREATE DATABASE planner',
        ]);
    }
}

async function runChecks() {
    ui.title = doctor ? 'A quick health check for your workspace.' : 'Let’s get the monorepo ready to build.';
    let app = readEnv(join(root, APP_ENV));
    let db = readEnv(join(root, DB_ENV));
    captureSecrets(app, db);
    if (previousEnvironment) prepareRetry(steps, previousEnvironment, { app, db }, doctor);
    if (process.env.ANTEATER_API_KEY) secrets.push(process.env.ANTEATER_API_KEY);

    await task('tools', async () => {
        const required = readFileSync(join(root, '.nvmrc'), 'utf8').trim();
        if (process.versions.node.split('.')[0] !== required) {
            mark(
                'tools',
                'blocked',
                `Use Node ${required}: run mise install, then mise run setup. Without mise: nvm install && nvm use.`
            );
            return;
        }
        const manager = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).packageManager;
        const version = manager.split('@')[1];
        const installed = await run('pnpm', ['--version'], { cwd: root, signal: abort.signal, timeout: 15_000 });
        if (!installed.ok || installed.output.trim() !== version) {
            if (doctor) {
                mark(
                    'tools',
                    'blocked',
                    `Node ${required} is ready; pnpm ${version} is missing or differs. Run setup to use the pinned version via npm exec.`
                );
                return;
            }
            pnpm = ['npm', ['exec', '--yes', `--package=${manager}`, '--', 'pnpm']];
            devCommand = `npm exec --yes --package=${manager} -- pnpm dev`;
            await pm(['--version']);
        }
        mark('tools', 'done', `Node ${process.versions.node} · pnpm ${version}${managed ? ' · managed by mise' : ''}`);
    });

    if (okay('tools'))
        await task('dependencies', async () => {
            if (!doctor) await pm(['install', '--frozen-lockfile'], { timeout: 15 * 60_000 });
            if (DEPENDENCY_MARKERS.some((file) => !existsSync(join(root, file)))) {
                mark(
                    'dependencies',
                    'blocked',
                    'Dependencies or generated API types are missing. Run setup with network access.'
                );
            } else mark('dependencies', 'done', 'Workspace packages and generated API types are present.');
        });
    else mark('dependencies', 'skipped', 'Resolve the toolchain first.');

    await task('environment', async () => {
        if (!doctor) {
            let key = process.env.ANTEATER_API_KEY || app.ANTEATER_API_KEY;
            if (isPlaceholder(key) && ui.interactive && !args.has('--yes')) {
                key = await ui.secret('Anteater API key · ask a project lead if you need one');
            }
            if (key) secrets.push(key);
            ({ app, db } = configureEnvironment(root, key));
            captureSecrets(app, db);
        }
        const problems = environmentProblems(root, app, db);
        mark(
            'environment',
            problems.length ? 'blocked' : 'done',
            problems.length ? problems.join('\n') : 'Local .env files ready; credentials preserved.'
        );
    });

    const dbIssue = databaseProblem(app, db);
    const overrides = environmentProblems(root, app, db).filter((issue) => issue.includes('overrides .env'));
    if (dbIssue || overrides.length) mark('database', 'blocked', dbIssue || overrides.join('\n'));
    else
        await task('database', async () => {
            await command('docker', ['compose', 'version'], { timeout: 15_000 });
            try {
                await command('docker', ['info'], { timeout: 15_000 });
            } catch {
                mark(
                    'database',
                    'blocked',
                    'Docker is unavailable. Start Docker Desktop or your Docker daemon, then rerun setup.'
                );
                return;
            }
            if (!doctor) {
                await command('docker', ['compose', 'up', '-d', '--wait', '--wait-timeout', '120', 'db'], {
                    timeout: 5 * 60_000,
                });
                if (!plannerDatabaseProblem(app)) await ensurePlannerDatabase();
            }
            await command('docker', [
                'compose',
                'exec',
                '-T',
                'db',
                'pg_isready',
                '-U',
                'postgres',
                '-d',
                'antalmanac',
            ]);
            const plannerIssue = plannerDatabaseProblem(app);
            if (!plannerIssue) {
                await command('docker', [
                    'compose',
                    'exec',
                    '-T',
                    'db',
                    'pg_isready',
                    '-U',
                    'postgres',
                    '-d',
                    'planner',
                ]);
                mark(
                    'database',
                    'done',
                    'PostgreSQL is accepting connections for the scheduler and planner databases.'
                );
            } else if (plannerIssue.startsWith('Planner is using a custom')) {
                mark('database', 'done', `Scheduler Postgres is accepting connections. ${plannerIssue}`);
            } else {
                mark('database', 'blocked', plannerIssue);
            }
        });

    if (okay('database') && okay('dependencies'))
        await task('migrations', async () => {
            if (doctor) {
                mark(
                    'migrations',
                    'skipped',
                    'Read-only check: migrations are not applied. Run setup to bring both schemas up to date.'
                );
            } else {
                await pm(['sched:db:migrate'], { env: { DB_URL: db.DB_URL } });
                const plannerIssue = plannerDatabaseProblem(app);
                if (plannerIssue?.startsWith('Planner is using a custom')) {
                    mark('migrations', 'done', `Scheduler schema migrated. ${plannerIssue}`);
                } else if (plannerIssue) {
                    mark('migrations', 'blocked', plannerIssue);
                } else {
                    await pm(['plan:db:migrate'], { env: { PLANNER_DATABASE_URL: app.PLANNER_DATABASE_URL } });
                    mark('migrations', 'done', 'Scheduler and planner schemas are migrated.');
                }
            }
        });
    else mark('migrations', 'skipped', 'Requires dependencies and the local database.');

    if (doctor) {
        const issues = generatedDataProblems(root);
        mark(
            'data',
            issues.length ? 'blocked' : 'done',
            issues.length ? issues.join('\n') : 'Generated course and term data are present.'
        );
    } else if (!okay('dependencies') || isPlaceholder(app.ANTEATER_API_KEY)) {
        mark(
            'data',
            'blocked',
            `Requires dependencies and a valid ANTEATER_API_KEY in ${APP_ENV}. Ask a project lead for a key, then rerun setup.`
        );
    } else
        await task('data', async () => {
            await pm(['get-data'], {
                env: { ANTEATER_API_KEY: app.ANTEATER_API_KEY },
                timeout: 15 * 60_000,
            });
            const issues = generatedDataProblems(root);
            if (issues.length) throw new Error(issues.join('\n'));
            mark('data', 'done', 'Course search, departments, terms, and section caches generated.');
        });

    const required = steps.filter((item) => item.id !== 'ready' && !(doctor && item.id === 'migrations'));
    const ready = required.every((item) => item.status === 'done');
    mark(
        'ready',
        ready ? 'done' : 'blocked',
        ready
            ? doctor
                ? 'Checks passed. Run setup to verify migrations before starting development.'
                : `Ready to start: ${devCommand} → http://localhost:3000`
            : 'Finish the items below, then rerun setup.'
    );
    previousEnvironment = { app, db };
    ui.command = '';
    return ready;
}

function printSummary(ready) {
    close();
    console.log(
        `\n  ANTALMANAC / ${ready ? (doctor ? 'checks passed' : 'workspace ready') : 'setup needs attention'}\n`
    );
    for (const item of steps)
        console.log(
            `  ${item.status === 'done' ? '✓' : item.status === 'skipped' ? '–' : '!'} ${item.label}\n    ${(item.detail || item.status).replaceAll('\n', '\n    ')}`
        );
    console.log(
        ready && !doctor
            ? `\n  Next: ${devCommand}\n  Open the URL printed by Next.js (usually http://localhost:3000).\n`
            : `\n  Continue: ${setupCommand}\n`
    );
    process.exitCode = ready ? 0 : 1;
}

async function startDevelopment() {
    close();
    console.log('\n  Starting AntAlmanac. Open the URL printed below. Ctrl+C stops the server.\n');
    const result = await run(pnpm[0], [...pnpm[1], 'dev'], {
        cwd: root,
        signal: abort.signal,
        inherit: true,
        timeout: 0,
    });
    process.exitCode = interrupted ? 130 : (result.code ?? 1);
}

async function main() {
    ui.open();
    const guided = ui.interactive && !args.has('--yes') && !args.has('--check');
    if (guided) {
        const choice = await ui.choose(
            'Make yourself at home.',
            ['Set up my workspace', 'Check my environment', 'Exit'],
            [
                'Install dependencies, configure local credentials, and prepare Postgres for Scheduler and Planner.',
                'Inspect tools, files, and services. Application files and services stay unchanged.',
                'Return to your terminal.',
            ]
        );
        if (choice === 2) return;
        doctor = choice === 1;
    } else if (!ui.interactive && !args.has('--yes') && !doctor) {
        throw new Error('No interactive terminal. Use --yes for setup or --check for read-only diagnosis.');
    }
    while (!interrupted) {
        const ready = await runChecks();
        if (!guided) {
            printSummary(ready);
            return;
        }
        ui.title = ready
            ? doctor
                ? 'Checks passed. Ready for the next step.'
                : 'Your workspace is ready. Let’s build.'
            : 'A few things need your attention.';
        let retry = false;
        while (!retry) {
            const action =
                ready && !doctor
                    ? 'Start the development server'
                    : doctor
                      ? 'Set up my workspace'
                      : 'Retry unfinished steps';
            const choice = await ui.choose(
                'What would you like to do next?',
                [action, 'Inspect results & recovery steps', 'Finish and print summary'],
                [
                    ready && !doctor
                        ? 'Hand the terminal to Next.js. Ctrl+C stops the server.'
                        : doctor
                          ? 'Install dependencies and apply the local configuration.'
                          : 'Fix the reported issues, then continue. Completed installs and fetches are kept in this session.',
                    'Scroll through every result, including error details and recovery commands.',
                    'Keep a readable report and the next command in your terminal.',
                ]
            );
            if (choice === 2) {
                printSummary(ready);
                return;
            }
            if (choice === 1) {
                await ui.details(steps.flatMap((item) => [`${item.label} / ${item.status}`, item.detail || '', '']));
            } else if (ready && !doctor) {
                await startDevelopment();
                return;
            } else {
                if (doctor) {
                    doctor = false;
                    previousEnvironment = null;
                    steps.forEach((item) => {
                        item.status = 'pending';
                    });
                }
                retry = true;
            }
        }
    }
}

try {
    await main();
} catch (error) {
    close();
    if (!interrupted) console.error(`\nSetup could not finish: ${redact(error.message, secrets)}`);
    process.exitCode = interrupted ? 130 : 1;
} finally {
    close();
    process.removeListener('SIGINT', cancel);
    process.removeListener('SIGTERM', cancel);
}
