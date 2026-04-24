import { getTableColumns, sql, type SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

type ConflictUpdatePolicy<T extends PgTable> = {
    [K in keyof T['_']['columns']]: 'update' | 'keep';
};

/**
 * Builds a `set` clause for `onConflictDoUpdate` from an exhaustive
 * per-column policy.
 *
 * @example
 * ```ts
 * await tx
 *     .insert(customEvents)
 *     .values(events)
 *     .onConflictDoUpdate({
 *         target: customEvents.id,
 *         set: buildConflictUpdateSet(customEvents, {
 *             id: 'keep',
 *             scheduleId: 'keep',
 *             title: 'update',
 *             start: 'update',
 *             end: 'update',
 *             days: 'update',
 *             color: 'update',
 *             building: 'update',
 *             createdAt: 'keep',
 *             lastUpdated: 'update',
 *         }),
 *     });
 * ```
 *
 * @see https://orm.drizzle.team/docs/guides/upsert#postgresql-and-sqlite
 */
export function buildConflictUpdateSet<T extends PgTable>(
    table: T,
    policy: ConflictUpdatePolicy<T>
): Partial<Record<keyof T['_']['columns'], SQL>> {
    const columns = getTableColumns(table);
    const set: Partial<Record<keyof T['_']['columns'], SQL>> = {};

    for (const key in policy) {
        if (policy[key] === 'update') {
            const colName = columns[key as keyof typeof columns].name;
            set[key as keyof T['_']['columns']] = sql.raw(`excluded."${colName.replace(/"/g, '""')}"`);
        }
    }

    return set;
}
