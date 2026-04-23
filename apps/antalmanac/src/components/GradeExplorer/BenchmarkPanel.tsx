import trpc from '$lib/api/trpc';
import { deriveQueryLabel, type GradeQuery } from '$stores/GradeExplorerStore';
import { useThemeStore } from '$stores/SettingsStore';
import { Alert, Box, Skeleton, Stack, Typography } from '@mui/material';
import type { AggregateGrades } from '@packages/antalmanac-types';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { aggregateFromRaw } from './useGradeQueries';
import type { QueryResult } from './useGradeQueries';

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'F', 'P', 'NP'] as const;
type GradeLetter = (typeof GRADE_ORDER)[number];

const GRADE_TO_COUNT_KEY: Record<GradeLetter, keyof AggregateGrades['gradeDistribution']> = {
    A: 'gradeACount',
    B: 'gradeBCount',
    C: 'gradeCCount',
    D: 'gradeDCount',
    F: 'gradeFCount',
    P: 'gradePCount',
    NP: 'gradeNPCount',
};

interface BenchmarkPanelProps {
    activeQuery: GradeQuery | undefined;
    activeResult: QueryResult | undefined;
    excludePNP: boolean;
    excludeCOVID: boolean;
}

/**
 * Total letter + P/NP students counted in a distribution. We drop W from
 * the denominator when converting to percentages, matching the
 * convention used in DistributionPanel.
 */
function distributionTotal(dist: AggregateGrades['gradeDistribution']): number {
    return (
        dist.gradeACount +
        dist.gradeBCount +
        dist.gradeCCount +
        dist.gradeDCount +
        dist.gradeFCount +
        dist.gradePCount +
        dist.gradeNPCount
    );
}

/**
 * Fetches a dept-wide baseline derived from the active query by stripping
 * the instructor + section-code filters. When COVID exclusion is on we
 * fall back to raw + client-side aggregate so that the baseline stays in
 * sync with the active query's distribution.
 */
function useBaseline(
    activeQuery: GradeQuery | undefined,
    excludePNP: boolean,
    excludeCOVID: boolean
): { data?: AggregateGrades['gradeDistribution']; loading: boolean; label: string } {
    const [data, setData] = useState<AggregateGrades['gradeDistribution'] | undefined>();
    const [loading, setLoading] = useState(false);

    const baselineInput = useMemo(() => {
        if (!activeQuery?.department) return null;
        return {
            department: activeQuery.department,
            courseNumber: activeQuery.courseNumber || undefined,
            year: activeQuery.year || undefined,
            quarter: activeQuery.quarter || undefined,
            division: activeQuery.division || undefined,
            excludePNP: excludePNP ? 'true' : undefined,
        };
    }, [activeQuery, excludePNP]);

    const key = baselineInput ? `${JSON.stringify(baselineInput)}::cov=${excludeCOVID}` : null;

    useEffect(() => {
        if (!baselineInput) {
            setData(undefined);
            return;
        }
        let cancelled = false;
        setLoading(true);

        const run = async () => {
            try {
                if (excludeCOVID) {
                    const raw = await trpc.grades.rawGrades.mutate(baselineInput);
                    if (cancelled) return;
                    const clean = raw.filter((row) => !(row.year >= '2020' && row.year <= '2021'));
                    setData(aggregateFromRaw(clean));
                } else {
                    const agg = await trpc.grades.aggregateGrades.query(baselineInput);
                    if (cancelled) return;
                    setData(agg.gradeDistribution);
                }
            } catch {
                if (cancelled) return;
                setData(undefined);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void run();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const label = useMemo(() => {
        if (!activeQuery?.department) return '';
        const parts = [activeQuery.department.toUpperCase()];
        if (activeQuery.courseNumber) parts.push(activeQuery.courseNumber);
        parts.push('(all instructors)');
        return parts.join(' ');
    }, [activeQuery]);

    return { data, loading, label };
}

export function BenchmarkPanel({ activeQuery, activeResult, excludePNP, excludeCOVID }: BenchmarkPanelProps) {
    const isDark = useThemeStore((s) => s.isDark);
    const axisColor = isDark ? '#eee' : '#222';

    const baseline = useBaseline(activeQuery, excludePNP, excludeCOVID);

    const hasInstructorFilter = Boolean(activeQuery?.instructor || activeQuery?.sectionCode);
    const hasActiveDistribution = Boolean(activeQuery && activeResult?.aggregate?.gradeDistribution);

    const chartData = useMemo(() => {
        if (!activeQuery) return [];
        const activeDist = activeResult?.aggregate?.gradeDistribution;
        const baselineDist = baseline.data;

        const activeTotal = activeDist ? distributionTotal(activeDist) : 0;
        const baselineTotal = baselineDist ? distributionTotal(baselineDist) : 0;

        return GRADE_ORDER.map((letter) => {
            const key = GRADE_TO_COUNT_KEY[letter];
            const activeCount = activeDist ? (activeDist[key] as number) : 0;
            const baselineCount = baselineDist ? (baselineDist[key] as number) : 0;
            return {
                name: letter,
                active: activeTotal > 0 ? Number(((activeCount / activeTotal) * 100).toFixed(2)) : 0,
                baseline: baselineTotal > 0 ? Number(((baselineCount / baselineTotal) * 100).toFixed(2)) : 0,
                activeCount,
                baselineCount,
            };
        });
    }, [activeQuery, activeResult, baseline.data]);

    if (!activeQuery) {
        return (
            <Stack alignItems="center" justifyContent="center" height={360} sx={{ color: 'text.secondary' }}>
                <Typography variant="body2">Select a query to benchmark.</Typography>
            </Stack>
        );
    }

    if (!activeQuery.department) {
        return (
            <Alert severity="info" sx={{ mt: 1 }}>
                Pick a department on your active query to see how it stacks up against the dept-wide baseline.
            </Alert>
        );
    }

    return (
        <Stack spacing={2}>
            {!hasInstructorFilter && (
                <Alert severity="info" variant="outlined">
                    Add an instructor (or section code) to your active query for a meaningful comparison — otherwise
                    both series will be identical.
                </Alert>
            )}

            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap rowGap={1}>
                <Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Active
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {deriveQueryLabel(activeQuery)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        GPA {activeResult?.aggregate?.gradeDistribution.averageGPA?.toFixed(2) ?? '—'}
                    </Typography>
                </Stack>
                <Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Baseline
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {baseline.label || '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        GPA {baseline.data?.averageGPA?.toFixed(2) ?? '—'}
                    </Typography>
                </Stack>
            </Stack>

            <Box sx={{ height: 360 }}>
                {(baseline.loading || activeResult?.loading) && !hasActiveDistribution ? (
                    <Skeleton variant="rectangular" width="100%" height="100%" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} />
                            <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 13 }} />
                            <YAxis tick={{ fill: axisColor, fontSize: 12 }} unit="%" width={48} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1e1e1e' : '#fff',
                                    border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                                    borderRadius: 4,
                                }}
                                formatter={(value: number, name: string, item) => {
                                    const payload = item.payload as Record<string, number | string>;
                                    const countKey = item.dataKey === 'active' ? 'activeCount' : 'baselineCount';
                                    const count = payload[countKey] ?? 0;
                                    return [`${value.toFixed(1)}% (${Number(count).toLocaleString()})`, name];
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 4 }} />
                            <Bar
                                dataKey="active"
                                name={deriveQueryLabel(activeQuery)}
                                fill="#22577A"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="baseline"
                                name={baseline.label || 'Baseline'}
                                fill={isDark ? '#777' : '#c7c7c7'}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Stack>
    );
}
