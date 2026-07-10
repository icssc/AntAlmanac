/**
 * Shim so the ported Planner controllers can keep importing `../db`.
 * The merged app uses the shared AntAlmanac database client.
 */
import { db } from '@packages/db';

export { db };

export type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];
