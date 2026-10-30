import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

export const root = join(import.meta.dirname, '../..');
export const APP_ENV = 'apps/antalmanac/.env';
export const DB_ENV = 'apps/antalmanac-scheduler/db/.env';
const OVERRIDE_FILES = ['.env.local', '.env.development', '.env.development.local'];

type Env = Record<string, string | undefined>;

export function readEnv(file: string): Env {
    const path = join(root, file);
    return existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {};
}

export function isPlaceholder(value: string | undefined) {
    return !value?.trim() || /^(replace-me|changeme|your[-_].*|url)$/i.test(value.trim());
}

/** Writes `values` into an env file. Existing real values are kept unless `overwrite` is set. */
export function writeEnv(file: string, values: Env, overwrite = false) {
    const path = join(root, file);
    let source = existsSync(path) ? readFileSync(path, 'utf8') : '';
    const existing = parseEnv(source);
    for (const [key, value] of Object.entries(values)) {
        if (value === undefined || (!overwrite && !isPlaceholder(existing[key]))) continue;
        const line = `${key}=${JSON.stringify(value)}`;
        source = Object.hasOwn(existing, key)
            ? source.replace(new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=.*$`, 'gm'), () => line)
            : `${source}${source && !source.endsWith('\n') ? '\n' : ''}${line}\n`;
    }
    writeFileSync(path, source, { mode: 0o600 });
}

export function createEnvFiles(apiKey: string | undefined) {
    for (const path of [APP_ENV, DB_ENV].map((file) => join(root, file))) {
        if (!existsSync(path)) writeFileSync(path, readFileSync(`${path}.example`), { mode: 0o600 });
    }
    writeEnv(APP_ENV, {
        ...readEnv(`${APP_ENV}.example`),
        ...(apiKey && { ANTEATER_API_KEY: apiKey }),
        BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
        PLANNER_SESSION_SECRET: randomBytes(32).toString('hex'),
    });
    writeEnv(DB_ENV, { ...readEnv(`${DB_ENV}.example`), DB_URL: readEnv(APP_ENV).DB_URL });
}

export function envProblems() {
    if (!existsSync(join(root, APP_ENV))) return [`${APP_ENV} does not exist yet. Setup creates it for you.`];
    const app = readEnv(APP_ENV);
    const problems: string[] = [];
    for (const key of Object.keys(readEnv(`${APP_ENV}.example`))) {
        if (isPlaceholder(app[key]) && key !== 'ANTEATER_API_KEY') problems.push(`Set ${key} in ${APP_ENV}.`);
        else if (process.env[key] && process.env[key] !== app[key]) {
            problems.push(`Your shell's ${key} overrides ${APP_ENV}. Unset it or make them match.`);
        }
    }
    if (isPlaceholder(readEnv(DB_ENV).DB_URL)) problems.push(`Set DB_URL in ${DB_ENV}.`);
    for (const file of OVERRIDE_FILES.filter((file) => existsSync(join(root, 'apps/antalmanac', file)))) {
        problems.push(`apps/antalmanac/${file} overrides .env. Move its settings into .env.`);
    }
    return problems;
}

export function isLocalDatabase(value: string | undefined, name: string) {
    if (!value || !URL.canParse(value)) return false;
    const url = new URL(value);
    return (
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
        ['', '5432'].includes(url.port) &&
        url.pathname === `/${name}` &&
        url.username === 'postgres' &&
        url.password === 'postgres'
    );
}

export function redact(text: string) {
    const app = readEnv(APP_ENV);
    const secrets = Object.entries(app)
        .filter(([key, value]) => /KEY|SECRET|TOKEN/.test(key) && !isPlaceholder(value))
        .map(([, value]) => value!);
    return secrets
        .reduce((result, secret) => result.replaceAll(secret, '[redacted]'), text)
        .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[database URL]');
}
