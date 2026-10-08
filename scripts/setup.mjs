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
    formatApiKeyInstructions,
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
        `AntAlmanac developer setup\n\n  mise run setup                  Recommended: managed toolchain + TUI\n  node scripts/setup.mjs           Interactive setup wizard\n  node scripts/setup.mjs --yes     Run setup without prompts\n  node scripts/setup.mjs --check   Read-only environment diagnosis\n  node scripts/setup.mjs --plain   Disable animation and color\n\nRequires Node ${readFileSync(join(root, '.nvmrc'), 'utf8').trim()}. Run from any directory.\nSetup installs pinned dependencies, prepares .env files, starts the local\nDocker database (scheduler + planner), applies migrations, and fetches course data.\nProvide ANTEATER_API_KEY through the environment, .env, or the masked prompt.\n${formatApiKeyInstructions('Paste the key at the masked prompt, or set ANTEATER_API_KEY before running setup.').join('\n')}\nExisting credentials are preserved. Missing prerequisites exit with code 1.\nCtrl+C exits with code 130; completed steps are safe to rerun.`
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
        const reason = result.timedOut
            ? 'The command timed out and was stopped.'
            : result.error
              ? `The command could not start (${result.error}).`
              : `Command exited ${result.code}.`;
        const output = redact(result.output, secrets)
            .trim()
            .split('\n')
            .map((line) => line.trimEnd())
            .filter(Boolean)
            .slice(-8);
        throw new Error(
            [[cmd, ...argv].join(' '), reason, ...(output.length ? ['Last output:', ...output] : [])].join('\n')
        );
    }
    return result.output.trim();
}
const pm = (argv, options) => command(pnpm[0], [...pnpm[1], ...argv], options);

const ADVICE = {
    tools: [
        'Install the Node version listed in .nvmrc.',
        'With Mise, run: mise install && mise run setup',
        'Without Mise, run: nvm install && nvm use, then node scripts/setup.mjs',
    ],
    dependencies: [
        'Check your network connection.',
        `Retry with ${setupCommand}. Packages install from the lockfile with pnpm install --frozen-lockfile.`,
    ],
    environment: [
        `Fill in every listed value in ${APP_ENV} and ${DB_ENV}.`,
        'When a shell variable overrides .env, unset it or set it to the same value as the file.',
        `Then rerun ${setupCommand}.`,
    ],
    database: [
        'Start Docker and wait until `docker info` succeeds.',
        'Free port 5432 if another Postgres is already listening there.',
        `Rerun ${setupCommand}. The database volume stays in place.`,
    ],
    migrations: [
        'Read the database error under What happened.',
        'Fix that error and retry. Leave the Docker volume in place so local data is kept.',
    ],
    data: formatApiKeyInstructions(`Save the key as ANTEATER_API_KEY in ${APP_ENV}, then rerun ${setupCommand}.`),
};

function headlineFor(id, body) {
    const lines = String(body)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const first = lines[0] || '';
    if (first && !/^(pnpm|npm|docker|node|mise)\b/.test(first)) return first;
    const command = lines.find((line) => /^(pnpm|npm|docker|node|mise)\b/.test(line));
    const outcome = lines.find(
        (line) =>
            /^Command exited \d+/.test(line) ||
            line.startsWith('The command timed out') ||
            line.startsWith('The command could not start')
    );
    if (command && outcome) {
        const short = command.length > 72 ? `${command.slice(0, 69)}…` : command;
        return `${outcome.replace(/\.$/, '')} while running ${short}.`;
    }
    return lines[0] || `${step(id).label} failed.`;
}

function report(id, status, headline, extra = [], advice = ADVICE[id]) {
    const lines = [headline];
    const happened = extra
        .flat()
        .map((line) => String(line).trimEnd())
        .filter((line, index, all) => line.trim() || (index > 0 && all[index - 1].trim()));
    if (happened[0]?.trim() === headline) happened.shift();
    if (happened.some((line) => line.trim())) lines.push('', 'What happened:', ...happened);
    if (advice?.length) {
        const numbered = advice.every((line, index) => line.startsWith(`${index + 1}. `));
        lines.push('', 'What to do:', ...(numbered ? advice : advice.map((line) => `• ${line}`)));
    }
    mark(id, status, lines.join('\n'));
}

function problems() {
    return steps.filter((item) => ['failed', 'blocked'].includes(item.status) && item.id !== 'ready');
}

async function task(id, action) {
    if (interrupted) throw new Error('Setup cancelled.');
    if (step(id).status === 'done') return;
    mark(id, 'running');
    try {
        await action();
    } catch (error) {
        if (interrupted) throw error;
        const body = error.message?.trim() || 'The step stopped before it reported a reason.';
        report(id, 'failed', headlineFor(id, body), body.split('\n'));
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForPostgres() {
    let lastError = new Error('PostgreSQL did not finish starting.');
    for (let attempt = 0; attempt < 60; attempt++) {
        try {
            // pid 1 is the entrypoint shell until init finishes and execs postgres.
            const leader = await command('docker', ['compose', 'exec', '-T', 'db', 'cat', '/proc/1/comm']);
            if (leader.trim() !== 'postgres') throw new Error('PostgreSQL is still initializing.');
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
            return;
        } catch (error) {
            lastError = error;
            await delay(1000);
        }
    }
    throw new Error(
        `PostgreSQL did not accept connections within 60 seconds.\nSetup waits until the Postgres process itself is running, because the container can answer checks while it is still initializing.\nLast check:\n${lastError.message}`
    );
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
            report(
                'tools',
                'blocked',
                `Node ${process.versions.node} is active, and this repo requires Node ${required}.`
            );
            return;
        }
        const manager = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).packageManager;
        const version = manager.split('@')[1];
        const installed = await run('pnpm', ['--version'], { cwd: root, signal: abort.signal, timeout: 15_000 });
        if (!installed.ok || installed.output.trim() !== version) {
            if (doctor) {
                report(
                    'tools',
                    'blocked',
                    `pnpm ${version} is required, and this shell does not have that exact version.`,
                    [`Node ${required} is already active.`]
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
                report('dependencies', 'blocked', 'Workspace packages or generated API types are missing.', [
                    'Setup looks for installed packages and the generated Anteater API types.',
                ]);
            } else mark('dependencies', 'done', 'Workspace packages and generated API types are present.');
        });
    else mark('dependencies', 'skipped', 'Waiting on Node and pnpm before installing packages.');

    await task('environment', async () => {
        if (!doctor) {
            let key = process.env.ANTEATER_API_KEY || app.ANTEATER_API_KEY;
            if (isPlaceholder(key) && ui.interactive && !args.has('--yes')) {
                key = await ui.secret(
                    'Anteater API key',
                    formatApiKeyInstructions(
                        'Paste the key below. Enter skips. It is stored only in apps/antalmanac/.env.'
                    )
                );
            }
            if (key) secrets.push(key);
            ({ app, db } = configureEnvironment(root, key));
            captureSecrets(app, db);
        }
        const issues = environmentProblems(root, app, db);
        if (issues.length) {
            report(
                'environment',
                'blocked',
                issues.length === 1
                    ? issues[0]
                    : `${issues.length} local settings are missing or conflict with the shell.`,
                issues.length === 1 ? [] : issues
            );
        } else mark('environment', 'done', 'Local .env files are ready, and existing credentials were kept.');
    });

    const dbIssue = databaseProblem(app, db);
    const overrides = environmentProblems(root, app, db).filter((issue) => issue.includes('overrides .env'));
    if (dbIssue || overrides.length) {
        const issue = dbIssue || overrides.join('\n');
        const advice =
            overrides.length && !dbIssue
                ? ADVICE.environment
                : dbIssue?.includes('STAGE')
                  ? [`Set STAGE=local in ${APP_ENV}, then rerun ${setupCommand}.`]
                  : [
                        'Setup migrates only the local Docker database described in .env.example.',
                        'For any other database, run pnpm sched:db:migrate yourself once that database is ready.',
                    ];
        report('database', 'blocked', headlineFor('database', issue), issue.split('\n'), advice);
    } else
        await task('database', async () => {
            await command('docker', ['compose', 'version'], { timeout: 15_000 });
            try {
                await command('docker', ['info'], { timeout: 15_000 });
            } catch {
                report('database', 'blocked', 'Docker is not running, so PostgreSQL cannot start.', [
                    '`docker info` failed. The daemon is stopped or this shell cannot reach it.',
                ]);
                return;
            }
            if (!doctor) {
                let startupError;
                try {
                    await command('docker', ['compose', 'up', '-d', '--wait', '--wait-timeout', '120', 'db'], {
                        timeout: 5 * 60_000,
                    });
                } catch (error) {
                    startupError = error;
                }
                try {
                    await waitForPostgres();
                } catch (error) {
                    throw startupError ?? error;
                }
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
                report(
                    'database',
                    'blocked',
                    plannerIssue,
                    [],
                    [
                        `Set PLANNER_DATABASE_URL in ${APP_ENV} to the local planner database, then rerun ${setupCommand}.`,
                    ]
                );
            }
        });

    if (okay('database') && okay('dependencies'))
        await task('migrations', async () => {
            if (doctor) {
                mark(
                    'migrations',
                    'skipped',
                    'This was a read-only check, so migrations were not applied. Run setup when you want both schemas updated.'
                );
            } else {
                await pm(['sched:db:migrate'], { env: { DB_URL: db.DB_URL } });
                const plannerIssue = plannerDatabaseProblem(app);
                if (plannerIssue?.startsWith('Planner is using a custom')) {
                    mark('migrations', 'done', `Scheduler schema migrated. ${plannerIssue}`);
                } else if (plannerIssue) {
                    report(
                        'migrations',
                        'blocked',
                        plannerIssue,
                        [],
                        [
                            `Set PLANNER_DATABASE_URL in ${APP_ENV}, then rerun ${setupCommand}. Scheduler migrations that already ran are kept.`,
                        ]
                    );
                } else {
                    await pm(['plan:db:migrate'], { env: { PLANNER_DATABASE_URL: app.PLANNER_DATABASE_URL } });
                    mark('migrations', 'done', 'Scheduler and planner schemas are migrated.');
                }
            }
        });
    else mark('migrations', 'skipped', 'Waiting on installed packages and a running database before migrating.');

    if (doctor) {
        const issues = generatedDataProblems(root);
        if (issues.length) {
            report('data', 'blocked', 'Generated course data is missing or empty.', issues, [
                `Run ${setupCommand} to download it. A read-only check does not fetch courses.`,
                `The download needs a real ANTEATER_API_KEY in ${APP_ENV}. Create one at https://dashboard.anteaterapi.com/ if you do not have it.`,
            ]);
        } else mark('data', 'done', 'Generated course and term data are present.');
    } else if (!okay('dependencies') || isPlaceholder(app.ANTEATER_API_KEY)) {
        const missing = [
            okay('dependencies') ? '' : 'Workspace dependencies are not installed yet.',
            isPlaceholder(app.ANTEATER_API_KEY)
                ? `ANTEATER_API_KEY in ${APP_ENV} is missing or still a placeholder.`
                : '',
        ].filter(Boolean);
        report('data', 'blocked', 'Course data was not fetched.', missing);
    } else
        await task('data', async () => {
            await pm(['get-data'], {
                env: { ANTEATER_API_KEY: app.ANTEATER_API_KEY },
                timeout: 15 * 60_000,
            });
            const issues = generatedDataProblems(root);
            if (issues.length) {
                report('data', 'failed', 'Course data finished without usable files.', issues, [
                    'Read the fetch output above, then run pnpm get-data again.',
                    `If the API rejected the key, create a new secret at https://dashboard.anteaterapi.com/ and save it in ${APP_ENV}.`,
                ]);
                return;
            }
            mark('data', 'done', 'Course search, departments, terms, and section caches generated.');
        });

    const required = steps.filter((item) => item.id !== 'ready' && !(doctor && item.id === 'migrations'));
    const ready = required.every((item) => item.status === 'done');
    const outstanding = problems();
    mark(
        'ready',
        ready ? 'done' : 'blocked',
        ready
            ? doctor
                ? 'Checks passed. Run setup to apply migrations before starting development.'
                : `Ready to start: ${devCommand} → http://localhost:3000`
            : outstanding.length
              ? `${outstanding.map((item) => item.label).join(', ')} must succeed before AntAlmanac can start. Rerun ${setupCommand} after fixing them. Completed steps are kept.`
              : `Finish the remaining steps, then rerun ${setupCommand}.`
    );
    previousEnvironment = { app, db };
    ui.command = '';
    return ready;
}

function printSummary(ready) {
    close();
    const outstanding = problems();
    console.log(
        `\n  ANTALMANAC / ${ready ? (doctor ? 'checks passed' : 'workspace ready') : 'setup needs attention'}\n`
    );
    if (!ready && outstanding.length) {
        console.log(
            `  ${outstanding.length === 1 ? 'This step needs a fix' : 'These steps need a fix'} before AntAlmanac can start:\n`
        );
    }
    for (const item of steps) {
        const glyph =
            item.status === 'done' ? '✓' : item.status === 'skipped' ? '–' : item.status === 'failed' ? '×' : '!';
        console.log(`  ${glyph} ${item.label}`);
        for (const line of (item.detail || item.status).split('\n')) console.log(`    ${line}`);
        console.log('');
    }
    console.log(
        ready && !doctor
            ? `  Next: ${devCommand}\n  Open the URL printed by Next.js (usually http://localhost:3000).\n`
            : `  Continue: ${setupCommand}\n`
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
        throw new Error(
            'No interactive terminal, so setup did not change anything. Use --yes to set up the workspace, or --check for a read-only diagnosis.'
        );
    }
    while (!interrupted) {
        const ready = await runChecks();
        if (!guided) {
            printSummary(ready);
            return;
        }
        const outstanding = problems();
        ui.title = ready
            ? doctor
                ? 'Checks passed. Ready for the next step.'
                : 'Your workspace is ready. Let’s build.'
            : outstanding.length === 1
              ? `${outstanding[0].label} needs a fix.`
              : outstanding.length
                ? `${outstanding.length} steps need a fix.`
                : 'A few things still need to be finished.';
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
                [
                    action,
                    outstanding.length ? 'See what failed and how to fix it' : 'Review the full results',
                    'Finish and print the full report',
                ],
                [
                    ready && !doctor
                        ? 'Hand the terminal to Next.js. Ctrl+C stops the server.'
                        : doctor
                          ? 'Install dependencies and apply the local configuration.'
                          : outstanding.length
                            ? `Retries ${outstanding.map((item) => item.label).join(', ')}. Completed installs and downloads are kept.`
                            : 'Continues setup. Completed installs and downloads are kept.',
                    outstanding.length
                        ? 'Shows the cause, the command output, and the exact next step for every step that failed.'
                        : 'Scroll through every result.',
                    'Prints the same report in your terminal, including how to fix each step.',
                ]
            );
            if (choice === 2) {
                printSummary(ready);
                return;
            }
            if (choice === 1) {
                const names = {
                    done: 'Done',
                    running: 'Running',
                    pending: 'Not started',
                    skipped: 'Skipped',
                    failed: 'Failed',
                    blocked: 'Needs a fix',
                };
                await ui.details(
                    steps.flatMap((item) => [
                        `${item.label} — ${names[item.status] || item.status}`,
                        ...(item.detail ? item.detail.split('\n') : ['No details yet.']),
                        '',
                    ])
                );
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
    if (!interrupted)
        console.error(
            `\nSetup stopped because of an unexpected error.\n\n${redact(error.message, secrets)}\n\nRerun ${setupCommand}. Steps that already finished are kept.\n`
        );
    process.exitCode = interrupted ? 130 : 1;
} finally {
    close();
    process.removeListener('SIGINT', cancel);
    process.removeListener('SIGTERM', cancel);
}
