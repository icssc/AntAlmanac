/**
 * Zod argument fragments shared across MCP tool groups. Extracting the repeated pieces keeps
 * tool definitions terse and their wording consistent.
 * @module
 */

// The MCP SDK's registerTool typing is pathologically slow with zod's v3 API (TS2589 / tsc OOM),
// so tool schemas use the v4 API bundled with zod 3.25.
import { z } from 'zod/v4';

/** A course ID with no spaces, e.g. "COMPSCI161". */
export const courseIdSchema = z.string().describe('Course ID with no spaces, e.g. "COMPSCI161".');

/** Start year of an academic year, e.g. 2024 for 2024–2025. */
export const academicYearSchema = z
    .number()
    .int()
    .describe('Start year of the academic year, e.g. 2024 for 2024–2025.');

/** Quarters a grade distribution may be filtered by (WebSOC term naming). */
export const gradeQuarterSchema = z.enum(['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2']);
