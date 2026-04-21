import trpc from '$lib/api/trpc';
import { isCovidSection, type GradeQuery } from '$stores/GradeExplorerStore';
import type { AggregateGrades, RawGrades, RawGradeSection } from '@packages/antalmanac-types';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface QueryResult {
    aggregate?: AggregateGrades;
    raw?: RawGrades;
    loading: boolean;
    error?: string;
}

export type QueryResults = Record<number, QueryResult>;

export interface UseGradeQueriesOptions {
    includeRaw: boolean;
    excludePNP: boolean;
    excludeCOVID: boolean;
}

/**
 * Any filter field that would actually narrow the Anteater query. If
 * nothing is set we skip the call (otherwise Anteater would refuse to
 * return the entire grades corpus).
 */
function isQueryRunnable(query: GradeQuery): boolean {
    return Boolean(
        query.department || query.courseNumber || query.instructor || query.sectionCode || query.year || query.quarter
    );
}

/** Shape sent to both trpc procedures. */
function toApiInput(query: GradeQuery, excludePNP: boolean) {
    return {
        department: query.department || undefined,
        courseNumber: query.courseNumber || undefined,
        instructor: query.instructor || undefined,
        sectionCode: query.sectionCode || undefined,
        year: query.year || undefined,
        quarter: query.quarter || undefined,
        division: query.division || undefined,
        excludePNP: excludePNP ? 'true' : undefined,
    };
}

function serializeInput(input: ReturnType<typeof toApiInput>): string {
    return JSON.stringify(input);
}

/**
 * Sum letter-grade counts (A/B/C/D/F) on a section. Used as the weight
 * when computing averages from raw rows; we intentionally skip P/NP/W
 * since they don't contribute to GPA.
 */
function letterGradeTotal(row: RawGradeSection): number {
    return row.gradeACount + row.gradeBCount + row.gradeCCount + row.gradeDCount + row.gradeFCount;
}

/**
 * Fold per-section raw rows into a single aggregate distribution, matching
 * the shape of `AggregateGrades['gradeDistribution']`. `averageGPA` is
 * computed as a weighted mean using letter-grade counts as weights.
 */
export function aggregateFromRaw(rows: RawGrades): AggregateGrades['gradeDistribution'] {
    let gradeACount = 0;
    let gradeBCount = 0;
    let gradeCCount = 0;
    let gradeDCount = 0;
    let gradeFCount = 0;
    let gradePCount = 0;
    let gradeNPCount = 0;
    let gradeWCount = 0;
    let weightedGpaSum = 0;
    let weight = 0;

    for (const row of rows) {
        gradeACount += row.gradeACount;
        gradeBCount += row.gradeBCount;
        gradeCCount += row.gradeCCount;
        gradeDCount += row.gradeDCount;
        gradeFCount += row.gradeFCount;
        gradePCount += row.gradePCount;
        gradeNPCount += row.gradeNPCount;
        gradeWCount += row.gradeWCount;

        if (row.averageGPA != null) {
            const w = letterGradeTotal(row);
            if (w > 0) {
                weightedGpaSum += row.averageGPA * w;
                weight += w;
            }
        }
    }

    return {
        gradeACount,
        gradeBCount,
        gradeCCount,
        gradeDCount,
        gradeFCount,
        gradePCount,
        gradeNPCount,
        gradeWCount,
        averageGPA: weight > 0 ? weightedGpaSum / weight : null,
    };
}

/**
 * Fetches aggregate + raw data for every runnable query.
 *
 * - `excludePNP` is forwarded to Anteater (server-side).
 * - `excludeCOVID` is applied client-side: when on, raw rows in the
 *   COVID window are stripped and the aggregate is recomputed from the
 *   remaining rows (so the Distribution / Benchmark panels stay in sync
 *   with the Trend / Details panels).
 */
export function useGradeQueries(queries: GradeQuery[], options: UseGradeQueriesOptions): QueryResults {
    const { includeRaw, excludePNP, excludeCOVID } = options;

    const [rawResults, setRawResults] = useState<QueryResults>({});
    const inflightRef = useRef<Map<string, Promise<unknown>>>(new Map());

    // When COVID filter is on we must always have raw data for every query
    // so we can recompute aggregates client-side; otherwise the distribution
    // would still include the COVID quarters.
    const needsRaw = includeRaw || excludeCOVID;

    const signature = useMemo(() => {
        const queryPart = queries.map((q) => `${q.id}:${serializeInput(toApiInput(q, excludePNP))}`).join('|');
        return `${queryPart}::raw=${needsRaw}`;
    }, [queries, excludePNP, needsRaw]);

    useEffect(() => {
        let cancelled = false;

        setRawResults((prev) => {
            const next: QueryResults = {};
            for (const q of queries) {
                if (prev[q.id]) next[q.id] = prev[q.id];
            }
            return next;
        });

        for (const query of queries) {
            if (!isQueryRunnable(query)) {
                setRawResults((prev) => ({ ...prev, [query.id]: { loading: false } }));
                continue;
            }

            const input = toApiInput(query, excludePNP);

            setRawResults((prev) => ({
                ...prev,
                [query.id]: { ...prev[query.id], loading: true, error: undefined },
            }));

            const aggregateKey = `agg:${serializeInput(input)}`;
            let aggregatePromise = inflightRef.current.get(aggregateKey);
            if (!aggregatePromise) {
                aggregatePromise = trpc.grades.aggregateGrades.query(input);
                inflightRef.current.set(aggregateKey, aggregatePromise);
            }

            aggregatePromise
                .then((data) => {
                    if (cancelled) return;
                    setRawResults((prev) => ({
                        ...prev,
                        [query.id]: {
                            ...prev[query.id],
                            aggregate: data as AggregateGrades,
                            loading: needsRaw && prev[query.id]?.raw === undefined,
                        },
                    }));
                })
                .catch((err: unknown) => {
                    if (cancelled) return;
                    setRawResults((prev) => ({
                        ...prev,
                        [query.id]: {
                            ...prev[query.id],
                            loading: false,
                            error: err instanceof Error ? err.message : 'Failed to load grades',
                        },
                    }));
                })
                .finally(() => {
                    inflightRef.current.delete(aggregateKey);
                });

            if (needsRaw) {
                const rawKey = `raw:${serializeInput(input)}`;
                let rawPromise = inflightRef.current.get(rawKey);
                if (!rawPromise) {
                    rawPromise = trpc.grades.rawGrades.mutate(input);
                    inflightRef.current.set(rawKey, rawPromise);
                }

                rawPromise
                    .then((data) => {
                        if (cancelled) return;
                        setRawResults((prev) => ({
                            ...prev,
                            [query.id]: {
                                ...prev[query.id],
                                raw: data as RawGrades,
                                loading: false,
                            },
                        }));
                    })
                    .catch((err: unknown) => {
                        if (cancelled) return;
                        setRawResults((prev) => ({
                            ...prev,
                            [query.id]: {
                                ...prev[query.id],
                                loading: false,
                                error: err instanceof Error ? err.message : 'Failed to load section rows',
                            },
                        }));
                    })
                    .finally(() => {
                        inflightRef.current.delete(rawKey);
                    });
            }
        }

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature]);

    // Apply client-side COVID filtering on the already-fetched results. We
    // memoize so panels downstream get stable references.
    return useMemo<QueryResults>(() => {
        if (!excludeCOVID) return rawResults;

        const filtered: QueryResults = {};
        for (const [id, result] of Object.entries(rawResults)) {
            const key = Number(id);
            if (!result.raw) {
                filtered[key] = result;
                continue;
            }
            const cleanRaw = result.raw.filter((row) => !isCovidSection(row.year, row.quarter));
            const recomputedDistribution = aggregateFromRaw(cleanRaw);
            const originalSectionList = result.aggregate?.sectionList ?? [];
            const cleanSectionList = originalSectionList.filter(
                (section) => !isCovidSection(section.year, section.quarter)
            );
            filtered[key] = {
                ...result,
                raw: cleanRaw,
                aggregate: result.aggregate
                    ? {
                          sectionList: cleanSectionList,
                          gradeDistribution: recomputedDistribution,
                      }
                    : undefined,
            };
        }
        return filtered;
    }, [rawResults, excludeCOVID]);
}
