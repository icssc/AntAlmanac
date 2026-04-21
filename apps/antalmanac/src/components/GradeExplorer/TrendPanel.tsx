import { colorForIndex, deriveQueryLabel, type GradeQuery } from '$stores/GradeExplorerStore';
import { useThemeStore } from '$stores/SettingsStore';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import type { RawGrades } from '@packages/antalmanac-types';
import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { QueryResults } from './useGradeQueries';

interface TrendPanelProps {
    queries: GradeQuery[];
    results: QueryResults;
}

/**
 * Weighted average GPA per year, using letter-grade (A-F) counts as the
 * weight. Returns entries sorted ascending by year so the x-axis reads
 * left-to-right chronologically.
 */
function yearlyWeightedGPA(rows: RawGrades): Array<{ year: number; gpa: number; students: number }> {
    const buckets = new Map<string, { weightedSum: number; weight: number; students: number }>();
    for (const row of rows) {
        const letters = row.gradeACount + row.gradeBCount + row.gradeCCount + row.gradeDCount + row.gradeFCount;
        const totalStudents = letters + row.gradePCount + row.gradeNPCount + row.gradeWCount;
        const bucket = buckets.get(row.year) ?? { weightedSum: 0, weight: 0, students: 0 };
        if (row.averageGPA != null && letters > 0) {
            bucket.weightedSum += row.averageGPA * letters;
            bucket.weight += letters;
        }
        bucket.students += totalStudents;
        buckets.set(row.year, bucket);
    }

    return [...buckets.entries()]
        .filter(([, b]) => b.weight > 0)
        .map(([year, b]) => ({
            year: Number(year),
            gpa: Number((b.weightedSum / b.weight).toFixed(3)),
            students: b.students,
        }))
        .sort((a, b) => a.year - b.year);
}

export function TrendPanel({ queries, results }: TrendPanelProps) {
    const isDark = useThemeStore((s) => s.isDark);
    const axisColor = isDark ? '#eee' : '#222';

    const { chartData, allYears, loading, hasData } = useMemo(() => {
        const perQuery = queries.map((q) => ({
            query: q,
            points: yearlyWeightedGPA(results[q.id]?.raw ?? []),
        }));

        const years = new Set<number>();
        for (const { points } of perQuery) {
            for (const p of points) years.add(p.year);
        }
        const sortedYears = [...years].sort((a, b) => a - b);

        const chartData = sortedYears.map((year) => {
            const row: Record<string, number | null | string> = { year: String(year) };
            for (const { query, points } of perQuery) {
                const match = points.find((p) => p.year === year);
                row[`q${query.id}`] = match ? match.gpa : null;
                row[`q${query.id}_students`] = match ? match.students : 0;
            }
            return row;
        });

        return {
            chartData,
            allYears: sortedYears,
            loading: queries.some((q) => results[q.id]?.loading && !results[q.id]?.raw),
            hasData: perQuery.some(({ points }) => points.length > 0),
        };
    }, [queries, results]);

    if (loading && !hasData) {
        return <Skeleton variant="rectangular" width="100%" height={360} />;
    }

    if (!hasData) {
        return (
            <Stack alignItems="center" justifyContent="center" height={360} sx={{ color: 'text.secondary' }}>
                <Typography variant="body2">
                    Add a department, course, or instructor to see year-over-year trends.
                </Typography>
            </Stack>
        );
    }

    return (
        <Box sx={{ height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} />
                    <XAxis dataKey="year" tick={{ fill: axisColor, fontSize: 12 }} ticks={allYears.map(String)} />
                    <YAxis
                        tick={{ fill: axisColor, fontSize: 12 }}
                        domain={[0, 4]}
                        ticks={[0, 1, 2, 3, 4]}
                        label={{
                            value: 'Avg GPA',
                            angle: -90,
                            position: 'insideLeft',
                            fill: axisColor,
                            style: { fontSize: 12 },
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1e1e1e' : '#fff',
                            border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                            borderRadius: 4,
                        }}
                        formatter={(value: number | null, name: string, item) => {
                            if (value == null) return ['—', name];
                            const payload = item.payload as Record<string, number | string>;
                            const studentsKey = `${String(item.dataKey)}_students`;
                            const students = payload[studentsKey];
                            return [
                                `GPA ${value.toFixed(2)} (${Number(students ?? 0).toLocaleString()} students)`,
                                name,
                            ];
                        }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 4 }} />
                    {queries.map((query, idx) => (
                        <Line
                            key={query.id}
                            type="monotone"
                            dataKey={`q${query.id}`}
                            name={deriveQueryLabel(query)}
                            stroke={colorForIndex(idx)}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}
