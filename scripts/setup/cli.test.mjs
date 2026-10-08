import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { APP_ENV, DB_ENV, configureEnvironment, run } from './core.mjs';

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'aa-cli-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    cpSync(new URL('../', import.meta.url), join(root, 'scripts'), { recursive: true });
    const files = {
        '.nvmrc': process.versions.node.split('.')[0],
        'package.json': '{"packageManager":"pnpm@10.22.0"}',
        'node_modules/.modules.yaml': '',
        'apps/antalmanac/node_modules/next/package.json': '{}',
        'packages/db/node_modules/drizzle-kit/package.json': '{}',
        'packages/anteater-api/src/types/generated/anteater-api-types.ts': '',
        'apps/antalmanac/src/generated/termData.json': '[{"year":"2026"}]',
        'apps/antalmanac/src/generated/departments.json': '{"COMPSCI":"Computer Science"}',
        'apps/antalmanac/src/generated/searchData.json': '{"courses":[{}],"departments":[{}]}',
    };
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
        launch: (args, extra = {}) =>
            run(process.execPath, [join(root, 'scripts/setup.mjs'), ...args], { env: { ...env, ...extra } }),
    };
}

test('full setup orchestrates installation, healthy database, migrations, and data fetch', async (t) => {
    const { root, launch } = fixture(t);
    const result = await launch(['--yes', '--plain']);
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /workspace ready/);
    const calls = readFileSync(join(root, 'commands.log'), 'utf8');
    assert.match(calls, /install --frozen-lockfile/);
    assert.match(calls, /compose up -d --build --wait --wait-timeout 90 db/);
    assert.match(calls, /--dir packages\/db db:migrate/);
    assert.match(calls, /--dir apps\/antalmanac get-data/);
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
    assert.match(result.output, /Command exited 9/);
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
