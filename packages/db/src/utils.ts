import { getTableColumns, sql, type SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

export type ConflictUpdatePolicy<T extends PgTable> = {
    [K in keyof T['_']['columns']]: 'update' | 'keep';
};

type UpdateKeys<T extends Record<PropertyKey, unknown>> = {
    [K in keyof T]: T[K] extends 'update' ? K : never;
}[keyof T];

type NonEmptyArray<T> = readonly [T, ...T[]];

const excludedColumn = (columnName: string) => sql.raw(`excluded."${columnName.replace(/"/g, '""')}"`);

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
            set[key as keyof T['_']['columns']] = excludedColumn(colName);
        }
    }

    return set;
}

/**
 * Builds a `where` clause for `onConflictDoUpdate` that skips the update
 * unless at least one updated column differs from the inserted row.
 */
export function buildConflictUpdateWhereChanged<T extends PgTable, const P extends ConflictUpdatePolicy<T>>(
    table: T,
    _policy: P,
    keys: NonEmptyArray<UpdateKeys<P>>
): SQL {
    const columns = getTableColumns(table);

    const changedComparisons = keys.map((key) => {
        const column = columns[key as keyof typeof columns];
        return sql`${column} is distinct from ${excludedColumn(column.name)}`;
    });

    return sql.join(changedComparisons, sql` or `);
}
