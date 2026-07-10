/**
 * Shim so the ported Planner controllers can keep importing `../db/schema`.
 * The Planner tables live in the shared db package.
 */
export * from '@packages/db/src/schema/planner';
