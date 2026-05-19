import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsLibDir = dirname(fileURLToPath(import.meta.url));
const scriptsDir = dirname(scriptsLibDir);
const appRoot = dirname(scriptsDir);

export const GENERATED_DIR = join(appRoot, 'src/generated');
export const GENERATED_TERMS_DIR = join(GENERATED_DIR, 'terms');
export const TERM_DATA_FILE = join(GENERATED_DIR, 'termData.json');
export const DEPARTMENTS_FILE = join(GENERATED_DIR, 'departments.json');
export const SEARCH_DATA_FILE = join(GENERATED_DIR, 'searchData.json');
export const DEPLOYED_TERMS_FILE = join(GENERATED_DIR, 'deployed_terms.json');
/** Pre-refactor source file; safe to remove if present after migrating to `term.ts` + generated JSON. */
export const LEGACY_TERM_DATA_TS = join(appRoot, 'src/lib/termData.ts');
