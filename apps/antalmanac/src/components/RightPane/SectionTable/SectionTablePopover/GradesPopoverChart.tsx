import { useTheme } from '@mui/material/styles';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

interface GradesPopoverChartProps {
    grades: {
        name: string;
        all: number;
    }[];
}

export function GradesPopoverChart({ grades }: GradesPopoverChartProps) {
    const theme = useTheme();
    const secondaryColor = theme.palette.secondary.main;

    return (
        <ResponsiveContainer>
            <BarChart data={grades} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.palette.text.primary }} height={20} />
                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.primary }} unit="%" width={35} />
                <RechartsTooltip
                    contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: 0,
                    }}
                    labelStyle={{ color: secondaryColor }}
                    itemStyle={{ color: secondaryColor }}
                    labelFormatter={(gradeLabel) => `Grade ${gradeLabel}`}
                    formatter={(value) => {
                        const n = typeof value === 'number' ? value : Number(value);
                        const pct = Number.isFinite(n) ? n.toFixed(1) : String(value);
                        return [`${pct}%`];
                    }}
                />
                <Bar dataKey="all" fill={theme.palette.primary.main} />
            </BarChart>
        </ResponsiveContainer>
    );
}
