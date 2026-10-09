import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { parseEnv } from 'node:util';

import {
    APP_ENV,
    DB_ENV,
    LOCAL_DB,
    LOCAL_PLANNER_DB,
    configureEnvironment,
    databaseProblem,
    dockerSetupAdvice,
    dockerStartAdvice,
    environmentProblems,
    generatedDataProblems,
    isLocalDatabase,
    mergeEnv,
    plannerDatabaseProblem,
    readEnv,
    redact,
    run,
    saveApiKey,
} from './core.mjs';

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'aa-setup-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    for (const file of [APP_ENV, DB_ENV]) {
        mkdirSync(dirname(join(root, file)), { recursive: true });
        writeFileSync(join(root, `${file}.example`), readFileSync(new URL(`../../${file}.example`, import.meta.url)));
    }
    return root;
}

test('setup creates usable local defaults and is idempotent', (t) => {
    const root = fixture(t);
    const first = configureEnvironment(root, 'test-api-key');
    assert.equal(first.app.DB_URL, first.db.DB_URL);
    assert.equal(first.app.DB_URL, LOCAL_DB);
    assert.equal(first.app.PLANNER_DATABASE_URL, LOCAL_PLANNER_DB);
    assert.equal(first.app.ANTEATER_API_KEY, 'test-api-key');
    assert.match(first.app.BETTER_AUTH_SECRET, /^[a-f0-9]{64}$/);
    assert.match(first.app.PLANNER_SESSION_SECRET, /^[a-f0-9]{64}$/);
    assert.equal(databaseProblem(first.app, first.db), null);
    assert.equal(plannerDatabaseProblem(first.app), null);
    assert.deepEqual(environmentProblems(root), []);
    const contents = readFileSync(join(root, APP_ENV), 'utf8');
    configureEnvironment(root, 'different-key');
    assert.equal(readFileSync(join(root, APP_ENV), 'utf8'), contents);
});

test('a replacement Anteater API key overwrites the saved one', (t) => {
    const root = fixture(t);
    writeFileSync(
        join(root, APP_ENV),
        '# keep me\nANTEATER_API_KEY="old-key"\nDB_URL="postgres://postgres:postgres@localhost:5432/antalmanac"\n'
    );
    const saved = saveApiKey(root, 'new-key');
    const text = readFileSync(join(root, APP_ENV), 'utf8');
    assert.equal(saved, 'new-key');
    assert.match(text, /ANTEATER_API_KEY="new-key"/);
    assert.doesNotMatch(text, /old-key/);
    assert.match(text, /# keep me/);
    assert.match(text, /DB_URL/);
});

test('real credentials, comments, and custom database settings survive setup', (t) => {
    const root = fixture(t);
    const custom = 'postgres://owner:secret@custom.example/production';
    writeFileSync(
        join(root, APP_ENV),
        `# My configuration\nDB_URL="${custom}"\nBETTER_AUTH_SECRET=keep-this\nANTEATER_API_KEY=existing\nPLANNER_DATABASE_URL="${custom}"\nPLANNER_SESSION_SECRET=keep-planner\n`
    );
    const { app, db } = configureEnvironment(root, 'replacement');
    assert.equal(app.BETTER_AUTH_SECRET, 'keep-this');
    assert.equal(app.PLANNER_SESSION_SECRET, 'keep-planner');
    assert.equal(app.ANTEATER_API_KEY, 'existing');
    assert.equal(db.DB_URL, custom);
    assert.equal(app.PLANNER_DATABASE_URL, custom);
    assert.match(readFileSync(join(root, APP_ENV), 'utf8'), /^# My configuration/);
    assert.match(databaseProblem(app, db), /Automatic migrations require/);
    assert.match(plannerDatabaseProblem(app), /custom PLANNER_DATABASE_URL/);
});

test('empty template values are repaired and literal dollar signs are retained', () => {
    const merged = mergeEnv('export ANTEATER_API_KEY=replace-me\nBETTER_AUTH_SECRET=""\n# tail\n', {
        ANTEATER_API_KEY: 'value$&value',
        BETTER_AUTH_SECRET: 'fresh-secret',
        STAGE: 'local',
    });
    assert.equal(parseEnv(merged).ANTEATER_API_KEY, 'value$&value');
    assert.equal(parseEnv(merged).BETTER_AUTH_SECRET, 'fresh-secret');
    assert.match(merged, /# tail/);
});

test('a missing API key remains an explicit blocker', (t) => {
    const root = fixture(t);
    configureEnvironment(root);
    assert.deepEqual(environmentProblems(root), [`Set ANTEATER_API_KEY in ${APP_ENV}.`]);
});

test('Next.js override files are surfaced instead of declaring readiness', (t) => {
    const root = fixture(t);
    configureEnvironment(root, 'valid-key');
    writeFileSync(join(root, 'apps/antalmanac/.env.local'), 'DB_URL=custom');
    assert.match(environmentProblems(root)[0], /overrides .env/);
});

test('conflicting shell credentials are reported without revealing their values', (t) => {
    const root = fixture(t);
    const { app, db } = configureEnvironment(root, 'valid-key');
    const issues = environmentProblems(root, app, db, { DB_URL: 'postgres://user:secret@remote/db' });
    assert.equal(issues.length, 1);
    assert.match(issues[0], /Shell variable DB_URL overrides/);
    assert.doesNotMatch(issues[0], /secret/);
});

test('only the documented local databases are eligible for automatic migrations', () => {
    assert.equal(isLocalDatabase(LOCAL_DB), true);
    assert.equal(isLocalDatabase(LOCAL_DB.replace('localhost', '127.0.0.1')), true);
    assert.equal(isLocalDatabase(LOCAL_PLANNER_DB, 'planner'), true);
    assert.equal(isLocalDatabase(LOCAL_DB, 'planner'), false);
    for (const value of [
        undefined,
        'bad-url',
        LOCAL_DB.replace('localhost', 'db.example'),
        LOCAL_DB.replace('5432', '5433'),
        `${LOCAL_DB}?host=production.example`,
        LOCAL_DB.replace('/antalmanac', '/other'),
    ]) {
        assert.equal(isLocalDatabase(value), false);
    }
    assert.match(databaseProblem({ DB_URL: LOCAL_DB, STAGE: 'production' }, { DB_URL: LOCAL_DB }), /STAGE=local/);
});

test('diagnosis requires generated course data and does not write files', (t) => {
    const root = fixture(t);
    const exampleCount = Object.keys(readEnv(join(root, `${APP_ENV}.example`))).length;
    assert.equal(generatedDataProblems(root).length, 3);
    assert.equal(environmentProblems(root).length, exampleCount + 1);
});

test('command failures, timeouts, and cancellation are not reported as success', async () => {
    const failed = await run(process.execPath, ['-e', 'console.error("failed fetch"); process.exit(7)']);
    assert.equal(failed.ok, false);
    assert.equal(failed.code, 7);
    assert.match(failed.output, /failed fetch/);
    const timeout = await run(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { timeout: 100 });
    assert.equal(timeout.timedOut, true);
    assert.equal(timeout.ok, false);
    const controller = new AbortController();
    const pending = run(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { signal: controller.signal });
    controller.abort();
    assert.equal((await pending).ok, false);
});

test('diagnostics strip terminal escapes and redact secrets and database URLs', () => {
    assert.equal(
        redact('\x1b[31merror my-secret postgres://user:password@host/db Bearer token', ['my-secret']),
        'error [redacted] [database URL] Bearer [redacted]'
    );
});

test('retry keeps expensive completed work but rechecks tools and services', async () => {
    const { prepareRetry } = await import('./core.mjs');
    const steps = ['tools', 'dependencies', 'environment', 'database', 'migrations', 'data', 'ready'].map((id) => ({
        id,
        status: 'done',
    }));
    const config = {
        app: { DB_URL: LOCAL_DB, PLANNER_DATABASE_URL: LOCAL_PLANNER_DB, ANTEATER_API_KEY: 'key' },
        db: { DB_URL: LOCAL_DB },
    };
    prepareRetry(steps, config, config);
    assert.deepEqual(
        steps.filter((item) => item.status === 'done').map((item) => item.id),
        ['dependencies', 'migrations', 'data']
    );
    prepareRetry(steps, config, {
        app: { DB_URL: 'changed', PLANNER_DATABASE_URL: 'changed', ANTEATER_API_KEY: 'changed' },
        db: config.db,
    });
    assert.deepEqual(
        steps.filter((item) => item.status === 'done').map((item) => item.id),
        ['dependencies']
    );
    prepareRetry(steps, config, config, true);
    assert.ok(steps.every((item) => item.status === 'pending'));
});

test('missing Docker points Windows, macOS, and Linux at the right install', () => {
    assert.match(dockerSetupAdvice('win32').steps.join('\n'), /Docker Desktop/);
    assert.equal(dockerSetupAdvice('win32').url, 'https://www.docker.com/products/docker-desktop/');
    assert.match(dockerSetupAdvice('darwin').steps.join('\n'), /OrbStack/);
    assert.equal(dockerSetupAdvice('darwin').url, 'https://orbstack.dev/');
    assert.match(dockerSetupAdvice('linux').steps.join('\n'), /curl -fsSL https:\/\/get\.docker\.com \| sudo sh/);
    assert.equal(dockerSetupAdvice('linux').url, undefined);
    assert.match(dockerStartAdvice('win32').headline, /Docker Desktop/);
    assert.match(dockerStartAdvice('darwin').headline, /OrbStack/);
    assert.match(dockerStartAdvice('linux').steps.join('\n'), /systemctl start docker/);
});
