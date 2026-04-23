import { colorForIndex, deriveQueryLabel, type GradeQuery } from '$stores/GradeExplorerStore';
import { useThemeStore } from '$stores/SettingsStore';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import type { AggregateGrades } from '@packages/antalmanac-types';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { QueryResults } from './useGradeQueries';

const GRADE_ORDER = [
    'gradeACount',
    'gradeBCount',
    'gradeCCount',
    'gradeDCount',
    'gradeFCount',
    'gradePCount',
    'gradeNPCount',
] as const satisfies ReadonlyArray<keyof AggregateGrades['gradeDistribution']>;

const GRADE_LABEL: Record<(typeof GRADE_ORDER)[number], string> = {
    gradeACount: 'A',
    gradeBCount: 'B',
    gradeCCount: 'C',
    gradeDCount: 'D',
    gradeFCount: 'F',
    gradePCount: 'P',
    gradeNPCount: 'NP',
};

interface DistributionPanelProps {
    queries: GradeQuery[];
    results: QueryResults;
}

interface SummaryRow {
    queryId: number;
    label: string;
    color: string;
    averageGPA: number | null;
    totalStudents: number;
    sectionCount: number;
}

export function DistributionPanel({ queries, results }: DistributionPanelProps) {
    const isDark = useThemeStore((s) => s.isDark);
    const axisColor = isDark ? '#eee' : '#222';

    const chartData = useMemo(() => {
        return GRADE_ORDER.map((gradeKey) => {
            const row: Record<string, number | string> = { name: GRADE_LABEL[gradeKey] };
            for (const query of queries) {
                const result = results[query.id];
                const dist = result?.aggregate?.gradeDistribution;
                if (!dist) continue;
                const total = GRADE_ORDER.reduce((sum, key) => sum + (dist[key] ?? 0), 0);
                if (total === 0) continue;
                const pct = ((dist[gradeKey] ?? 0) / total) * 100;
                row[`q${query.id}`] = Number(pct.toFixed(2));
                row[`q${query.id}_count`] = dist[gradeKey] ?? 0;
            }
            return row;
        });
    }, [queries, results]);

    const summaries = useMemo<SummaryRow[]>(() => {
        return queries.map((query, idx) => {
            const dist = results[query.id]?.aggregate?.gradeDistribution;
            const sections = results[query.id]?.aggregate?.sectionList ?? [];
            const total = dist
                ? GRADE_ORDER.reduce((sum, key) => sum + (dist[key] ?? 0), 0) + (dist.gradeWCount ?? 0)
                : 0;
            return {
                queryId: query.id,
                label: deriveQueryLabel(query),
                color: colorForIndex(idx),
                averageGPA: dist?.averageGPA ?? null,
                totalStudents: total,
                sectionCount: sections.length,
            };
        });
    }, [queries, results]);

    const anyLoading = queries.some((q) => results[q.id]?.loading);
    const anyHasData = queries.some((q) => results[q.id]?.aggregate?.gradeDistribution);

    return (
        <Stack spacing={2} sx={{ height: '100%' }}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap rowGap={1}>
                {summaries.map((s) => (
                    <Box
                        key={s.queryId}
                        sx={{
                            px: 1.5,
                            py: 1,
                            borderLeft: `4px solid ${s.color}`,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                            borderRadius: 1,
                            minWidth: 180,
                        }}
                    >
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {s.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            GPA {s.averageGPA != null ? s.averageGPA.toFixed(2) : 'n/a'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {s.totalStudents.toLocaleString()} students · {s.sectionCount} sections
                        </Typography>
                    </Box>
                ))}
            </Stack>

            <Box sx={{ flex: 1, minHeight: 320, position: 'relative' }}>
                {anyLoading && !anyHasData ? (
                    <Skeleton variant="rectangular" width="100%" height="100%" />
                ) : !anyHasData ? (
                    <Stack alignItems="center" justifyContent="center" height="100%" sx={{ color: 'text.secondary' }}>
                        <Typography variant="body2">
                            Add a department, course, or instructor to load a distribution.
                        </Typography>
                    </Stack>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barCategoryGap={queries.length > 1 ? '20%' : '30%'}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} />
                            <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 13 }} />
                            <YAxis tick={{ fill: axisColor, fontSize: 12 }} unit="%" width={48} domain={[0, 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1e1e1e' : '#fff',
                                    border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                                    borderRadius: 4,
                                }}
                                formatter={(value: number, name: string, item) => {
                                    const payload = item.payload as Record<string, number | string>;
                                    const countKey = `${String(item.dataKey)}_count`;
                                    const count = payload[countKey];
                                    return [
                                        `${value.toFixed(2)}% (${Number(count ?? 0).toLocaleString()} students)`,
                                        name,
                                    ];
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 4 }} />
                            {queries.map((query, idx) => (
                                <Bar
                                    key={query.id}
                                    dataKey={`q${query.id}`}
                                    name={deriveQueryLabel(query)}
                                    fill={colorForIndex(idx)}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Stack>
    );
}
