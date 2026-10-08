import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { APP_ENV, DB_ENV, DEPENDENCY_MARKERS, GENERATED_DIR, configureEnvironment, run } from './core.mjs';

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'aa-cli-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    cpSync(new URL('../', import.meta.url), join(root, 'scripts'), { recursive: true });
    const files = {
        '.nvmrc': process.versions.node.split('.')[0],
        'package.json': '{"packageManager":"pnpm@10.22.0"}',
        [`${GENERATED_DIR}/termData.json`]: '[{"year":"2026"}]',
        [`${GENERATED_DIR}/departments.json`]: '{"COMPSCI":"Computer Science"}',
        [`${GENERATED_DIR}/searchData.json`]: '{"courses":[{}],"departments":[{}]}',
    };
    for (const file of DEPENDENCY_MARKERS) files[file] = file.endsWith('.ts') ? '' : '{}';
    files['node_modules/.modules.yaml'] = '';
    for (const file of [APP_ENV, DB_ENV])
        files[`${file}.example`] = readFileSync(new URL(`../../${file}.example`, import.meta.url), 'utf8');
    for (const [file, contents] of Object.entries(files)) {
        mkdirSync(dirname(join(root, file)), { recursive: true });
        writeFileSync(join(root, file), contents);
    }
    mkdirSync(join(root, 'bin'));
    const fake = `#!${process.execPath}
const fs = require('node:fs');
const args = process.argv.slice(2).join(' ');
fs.appendFileSync(process.env.COMMAND_LOG, process.argv[1] + ' ' + args + '\\n');
if (process.env.MISSING_PNPM && process.argv[1].endsWith('/pnpm')) process.exit(127);
if (args.endsWith('--version')) console.log('10.22.0');
if (args.includes("datname = 'planner'")) console.log('1');
if (args.includes('/proc/1/comm')) console.log('postgres');
if (process.env.FAIL_FETCH && args.includes('get-data')) { console.error(process.env.ANTEATER_API_KEY); process.exit(9); }
`;
    for (const cmd of ['pnpm', 'npm', 'docker']) writeFileSync(join(root, 'bin', cmd), fake, { mode: 0o755 });
    const env = {
        PATH: `${join(root, 'bin')}:${process.env.PATH}`,
        COMMAND_LOG: join(root, 'commands.log'),
        ANTEATER_API_KEY: 'fixture-secret',
    };
    return {
        root,
        env,
        launch: (launchArgs, extra = {}) =>
            run(process.execPath, [join(root, 'scripts/setup.mjs'), ...launchArgs], { env: { ...env, ...extra } }),
    };
}

test('full setup orchestrates installation, healthy database, both migrations, and data fetch', async (t) => {
    const { root, launch } = fixture(t);
    const result = await launch(['--yes', '--plain']);
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /workspace ready/);
    const calls = readFileSync(join(root, 'commands.log'), 'utf8');
    assert.match(calls, /install --frozen-lockfile/);
    assert.match(calls, /compose up -d --wait --wait-timeout 120 db/);
    assert.match(calls, /\/proc\/1\/comm/);
    assert.match(calls, /datname = 'planner'/);
    assert.doesNotMatch(calls, /CREATE DATABASE planner/);
    assert.match(calls, /sched:db:migrate/);
    assert.match(calls, /plan:db:migrate/);
    assert.match(calls, /get-data/);
    assert.equal(readEnvUrl(join(root, APP_ENV), 'PLANNER_DATABASE_URL').includes('/planner'), true);
});

test('an existing volume without the planner database gets one created', async (t) => {
    const { root, launch } = fixture(t);
    const docker = readFileSync(join(root, 'bin', 'docker'), 'utf8').replace(
        "if (args.includes(\"datname = 'planner'\")) console.log('1');\n",
        ''
    );
    writeFileSync(join(root, 'bin', 'docker'), docker);
    const result = await launch(['--yes', '--plain']);
    assert.equal(result.code, 0, result.output);
    assert.match(readFileSync(join(root, 'commands.log'), 'utf8'), /CREATE DATABASE planner/);
});

test('missing Docker explains the install and does not start a database', async (t) => {
    const { root, launch } = fixture(t);
    rmSync(join(root, 'bin', 'docker'));
    const result = await launch(['--yes', '--plain'], { PATH: join(root, 'bin') });
    assert.equal(result.code, 1);
    assert.match(result.output, /Docker is not installed/);
    assert.match(result.output, /curl -fsSL https:\/\/get\.docker\.com \| sudo sh/);
    assert.doesNotMatch(readFileSync(join(root, 'commands.log'), 'utf8'), /compose up/);
});

test('read-only diagnosis never creates env files or invokes mutating commands', async (t) => {
    const { root, launch } = fixture(t);
    const result = await launch(['--check']);
    assert.equal(result.code, 1);
    assert.equal(existsSync(join(root, APP_ENV)), false);
    const calls = readFileSync(join(root, 'commands.log'), 'utf8');
    assert.doesNotMatch(calls, /install|compose up|db:migrate|get-data/);
});

test('failed data fetch remains a failure even when stale generated files exist', async (t) => {
    const { launch } = fixture(t);
    const result = await launch(['--yes'], { FAIL_FETCH: '1' });
    assert.equal(result.code, 1);
    assert.match(result.output, /Downloading course data failed|Command exited 9 while running/);
    assert.match(result.output, /Command exited 9/);
    assert.match(result.output, /What happened/);
    assert.match(result.output, /What to do/);
    assert.match(result.output, /dashboard\.anteaterapi\.com/);
    assert.doesNotMatch(result.output, /fixture-secret|workspace ready/);
});

test('remote databases are preserved and never migrated', async (t) => {
    const { root, launch } = fixture(t);
    configureEnvironment(root, 'fixture-secret');
    writeFileSync(join(root, DB_ENV), 'DB_URL=postgres://user:secret@remote.example/prod\n');
    const result = await launch(['--yes']);
    assert.equal(result.code, 1);
    assert.doesNotMatch(readFileSync(join(root, 'commands.log'), 'utf8'), /db:migrate|compose up/);
    assert.doesNotMatch(result.output, /user:secret/);
});

test('noninteractive use requires an explicit mode before doing any work', async (t) => {
    const { root, launch } = fixture(t);
    const result = await launch([]);
    assert.equal(result.code, 1);
    assert.match(result.output, /Use --yes/);
    assert.equal(existsSync(join(root, 'commands.log')), false);
    assert.equal(existsSync(join(root, APP_ENV)), false);
});

test('missing pnpm uses the pinned npm exec toolchain and prints a usable start command', async (t) => {
    const { root, launch } = fixture(t);
    const result = await launch(['--yes'], { MISSING_PNPM: '1' });
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /Next: npm exec --yes --package=pnpm@10.22.0 -- pnpm dev/);
    assert.match(
        readFileSync(join(root, 'commands.log'), 'utf8'),
        /npm exec --yes --package=pnpm@10.22.0 -- pnpm install --frozen-lockfile/
    );
});

function readEnvUrl(path, key) {
    return readFileSync(path, 'utf8')
        .split('\n')
        .find((line) => line.startsWith(`${key}=`));
}
