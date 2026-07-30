import { useContext } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import ThemeContext from '../../style/theme-context';
import { GradesRaw } from '@peterportal/types';
import { getAggregateGradeData } from '../../helpers/gradeDist.ts';
import ChartTooltip from '../ChartTooltip/ChartTooltip.tsx';
import { getCssVariable } from '../../helpers/styling.ts';

interface ChartProps {
    gradeData: GradesRaw;
    quarter: string;
    professor?: string;
    course?: string;
}

export default function Chart({ gradeData, quarter, professor, course }: ChartProps) {
    const { darkMode } = useContext(ThemeContext);

    const aggregateGradeData = getAggregateGradeData(gradeData, professor, quarter, course);

    const data = [
        { grade: 'A', count: aggregateGradeData.gradeACount, fill: getCssVariable('--mui-palette-chart-a') },
        { grade: 'B', count: aggregateGradeData.gradeBCount, fill: getCssVariable('--mui-palette-chart-b') },
        { grade: 'C', count: aggregateGradeData.gradeCCount, fill: getCssVariable('--mui-palette-chart-c') },
        { grade: 'D', count: aggregateGradeData.gradeDCount, fill: getCssVariable('--mui-palette-chart-d') },
        { grade: 'F', count: aggregateGradeData.gradeFCount, fill: getCssVariable('--mui-palette-chart-f') },
        { grade: 'P', count: aggregateGradeData.gradePCount, fill: getCssVariable('--mui-palette-chart-pass') },
        { grade: 'NP', count: aggregateGradeData.gradeNPCount, fill: getCssVariable('--mui-palette-chart-noPass') },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
                <XAxis dataKey="grade" />
                <Tooltip
                    cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const { grade, count } = payload[0].payload;
                        return <ChartTooltip label={grade} value={count} />;
                    }}
                    isAnimationActive={false}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill={getCssVariable('--mui-palette-text-secondary')} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
