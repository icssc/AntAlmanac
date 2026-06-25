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
    const accentColor = theme.vars.palette.secondary.main;
    const textColor = theme.vars.palette.text.primary;
    const paperColor = theme.vars.palette.background.paper;

    return (
        <ResponsiveContainer>
            <BarChart data={grades} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} height={20} />
                <YAxis tick={{ fontSize: 12, fill: textColor }} unit="%" width={35} />
                <RechartsTooltip
                    contentStyle={{
                        backgroundColor: paperColor,
                        border: 0,
                    }}
                    labelStyle={{ color: accentColor }}
                    itemStyle={{ color: accentColor }}
                    labelFormatter={(gradeLabel) => `Grade ${gradeLabel}`}
                    formatter={(value) => {
                        const n = typeof value === 'number' ? value : Number(value);
                        const pct = Number.isFinite(n) ? n.toFixed(1) : String(value);
                        return [`${pct}%`];
                    }}
                />
                <Bar dataKey="all" fill={accentColor} />
            </BarChart>
        </ResponsiveContainer>
    );
}
