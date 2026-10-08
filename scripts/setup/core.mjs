import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv, stripVTControlCharacters } from 'node:util';

export const APP_ENV = 'apps/antalmanac/.env';
export const DB_ENV = 'apps/antalmanac-scheduler/db/.env';
export const LOCAL_DB = 'postgres://postgres:postgres@localhost:5432/antalmanac';
export const LOCAL_PLANNER_DB = 'postgres://postgres:postgres@localhost:5432/planner';
export const GENERATED_DIR = 'apps/antalmanac-scheduler/site/src/generated';

export function readEnv(path) {
    return existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {};
}

export function isPlaceholder(value) {
    return !value?.trim() || /^(replace-me|changeme|your[-_].*|url)$/i.test(value.trim());
}

export function isLocalDatabase(value, databaseName = 'antalmanac') {
    try {
        const url = new URL(value);
        return (
            ['postgres:', 'postgresql:'].includes(url.protocol) &&
            ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
            (!url.port || url.port === '5432') &&
            url.pathname === `/${databaseName}` &&
            url.username === 'postgres' &&
            url.password === 'postgres' &&
            !url.search &&
            !url.hash
        );
    } catch {
        return false;
    }
}

// Update only absent values and obvious template placeholders. Preserve comments and real credentials.
export function mergeEnv(source, values) {
    let result = source;
    const existing = parseEnv(source);
    for (const [key, value] of Object.entries(values)) {
        if (!isPlaceholder(existing[key]) || value === undefined) continue;
        const line = `${key}=${JSON.stringify(value)}`;
        const assignment = new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=.*$`, 'gm');
        if (Object.hasOwn(existing, key)) {
            result = result.replace(assignment, () => line);
        } else {
            result += `${result.endsWith('\n') || !result ? '' : '\n'}${line}\n`;
        }
    }
    return result;
}

export function configureEnvironment(root, apiKey) {
    const appPath = join(root, APP_ENV);
    const dbPath = join(root, DB_ENV);
    const app = readEnv(appPath);
    const db = readEnv(dbPath);
    const dbUrl = !isPlaceholder(app.DB_URL) ? app.DB_URL : !isPlaceholder(db.DB_URL) ? db.DB_URL : LOCAL_DB;
    const plannerUrl = !isPlaceholder(app.PLANNER_DATABASE_URL) ? app.PLANNER_DATABASE_URL : LOCAL_PLANNER_DB;
    const defaults = {
        ...readEnv(join(root, `${APP_ENV}.example`)),
        DB_URL: dbUrl,
        PLANNER_DATABASE_URL: plannerUrl,
        ANTEATER_API_KEY: isPlaceholder(apiKey) ? 'replace-me' : apiKey,
        BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
        PLANNER_SESSION_SECRET: randomBytes(32).toString('hex'),
    };
    for (const [path, values] of [
        [appPath, defaults],
        [dbPath, { DB_URL: dbUrl }],
    ]) {
        const source = existsSync(path) ? readFileSync(path, 'utf8') : '';
        const updated = mergeEnv(source, { ...readEnv(`${path}.example`), ...values });
        if (!existsSync(path) || source !== updated) writeFileSync(path, updated, { mode: 0o600 });
    }
    return { app: readEnv(appPath), db: readEnv(dbPath) };
}

export function databaseProblem(app, db) {
    if (app.STAGE !== 'local') return 'Set STAGE=local in apps/antalmanac/.env before local setup.';
    if (!isLocalDatabase(app.DB_URL) || !isLocalDatabase(db.DB_URL) || app.DB_URL !== db.DB_URL) {
        return 'Automatic migrations require the local Docker DB_URL from .env.example in apps/antalmanac/.env and apps/antalmanac-scheduler/db/.env. For a custom database, run pnpm sched:db:migrate yourself.';
    }
    return null;
}

export function plannerDatabaseProblem(app) {
    if (isPlaceholder(app.PLANNER_DATABASE_URL)) {
        return `Set PLANNER_DATABASE_URL in ${APP_ENV}. The local default is ${LOCAL_PLANNER_DB}.`;
    }
    if (!isLocalDatabase(app.PLANNER_DATABASE_URL, 'planner')) {
        return 'Planner is using a custom PLANNER_DATABASE_URL. Setup will not migrate it. Run pnpm plan:db:migrate yourself when that database is ready.';
    }
    return null;
}

export function environmentProblems(
    root,
    app = readEnv(join(root, APP_ENV)),
    db = readEnv(join(root, DB_ENV)),
    inherited = process.env
) {
    const issues = [];
    for (const key of Object.keys(readEnv(join(root, `${APP_ENV}.example`)))) {
        if (isPlaceholder(app[key])) issues.push(`Set ${key} in ${APP_ENV}.`);
        if (inherited[key] && inherited[key] !== app[key]) {
            issues.push(`Shell variable ${key} overrides .env. Unset it or align it with ${APP_ENV}.`);
        }
    }
    if (isPlaceholder(db.DB_URL)) issues.push(`Set DB_URL in ${DB_ENV}.`);
    // Next.js loads these ahead of .env. Do not claim that a different configuration is ready.
    for (const file of ['.env.local', '.env.development', '.env.development.local']) {
        if (existsSync(join(root, 'apps/antalmanac', file))) {
            issues.push(
                `Review apps/antalmanac/${file}: it overrides .env. Consolidate local settings into .env to use this wizard.`
            );
        }
    }
    return issues;
}

export function redact(output, secrets = []) {
    let text = stripVTControlCharacters(String(output));
    for (const secret of secrets.filter(Boolean).sort((a, b) => b.length - a.length)) {
        text = text.split(secret).join('[redacted]');
    }
    return text
        .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[database URL]')
        .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [redacted]');
}

export function run(command, args, { cwd, env, signal, onOutput, timeout = 120_000, inherit = false } = {}) {
    return new Promise((resolve) => {
        let output = '';
        let timedOut = false;
        const child = spawn(command, args, {
            cwd,
            env: { ...process.env, ...env },
            stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
            shell: process.platform === 'win32',
            detached: process.platform !== 'win32',
        });
        const collect = (chunk) => {
            output = (output + chunk.toString()).slice(-24_000);
            onOutput?.(output);
        };
        child.stdout?.on('data', collect);
        child.stderr?.on('data', collect);
        let killTimer;
        const terminate = () => {
            const kill = (sig) => {
                try {
                    if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, sig);
                    else child.kill(sig);
                } catch {
                    /* The process may already have exited. */
                }
            };
            kill('SIGTERM');
            killTimer = setTimeout(() => kill('SIGKILL'), 2000);
            killTimer.unref();
        };
        const timer =
            timeout > 0
                ? setTimeout(() => {
                      timedOut = true;
                      terminate();
                  }, timeout)
                : undefined;
        signal?.addEventListener('abort', terminate, { once: true });
        if (signal?.aborted) terminate();
        const finish = (code, error) => {
            clearTimeout(timer);
            clearTimeout(killTimer);
            signal?.removeEventListener('abort', terminate);
            resolve({ ok: code === 0 && !timedOut && !signal?.aborted, output, code, error, timedOut });
        };
        child.once('error', (error) => finish(null, error.message));
        child.once('close', (code) => finish(code));
    });
}

export function generatedDataProblems(root) {
    const dir = join(root, GENERATED_DIR);
    const issues = [];
    for (const file of ['termData.json', 'departments.json', 'searchData.json']) {
        try {
            const value = JSON.parse(readFileSync(join(dir, file), 'utf8'));
            const valid =
                file === 'termData.json'
                    ? Array.isArray(value) && value.length > 0
                    : file === 'searchData.json'
                      ? Array.isArray(value.courses) && value.courses.length > 0 && Array.isArray(value.departments)
                      : value && typeof value === 'object' && Object.keys(value).length > 0;
            if (!valid) throw new Error('Empty data');
        } catch {
            issues.push(`Generate ${file} with pnpm get-data.`);
        }
    }
    return issues;
}

export const DEPENDENCY_MARKERS = [
    'node_modules/.modules.yaml',
    'apps/antalmanac/node_modules/next/package.json',
    'apps/antalmanac-scheduler/db/node_modules/drizzle-kit/package.json',
    'apps/antalmanac-planner/api/node_modules/drizzle-kit/package.json',
    'packages/anteater-api/src/types/generated/anteater-api-types.ts',
];

// Only keep successful expensive work in this session. Always recheck live prerequisites.
export function prepareRetry(steps, previous, current, doctor = false) {
    const keep = new Set(doctor ? [] : ['dependencies', 'migrations', 'data']);
    if (
        previous.app.DB_URL !== current.app.DB_URL ||
        previous.db.DB_URL !== current.db.DB_URL ||
        previous.app.PLANNER_DATABASE_URL !== current.app.PLANNER_DATABASE_URL
    ) {
        keep.delete('migrations');
    }
    if (previous.app.ANTEATER_API_KEY !== current.app.ANTEATER_API_KEY) keep.delete('data');
    for (const step of steps) {
        if (step.status === 'done' && keep.has(step.id)) continue;
        step.status = 'pending';
        step.detail = undefined;
    }
}
