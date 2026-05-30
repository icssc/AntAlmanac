import type { EnrollmentHistoryDay } from '$lib/enrollmentHistory';
import { useTheme } from '@mui/material/styles';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

interface EnrollmentHistoryPopoverChartProps {
    days: EnrollmentHistoryDay[];
}

export default function EnrollmentHistoryPopoverChart({ days }: EnrollmentHistoryPopoverChartProps) {
    const theme = useTheme();
    const chartColors = theme.palette.enrollmentStatus;

    return (
        <ResponsiveContainer>
            <LineChart data={days} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />
                <Legend wrapperStyle={{ left: 0, width: '100%' }} />

                <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.primary }} />
                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.primary }} width={35} />

                <Line
                    type="monotone"
                    dataKey="totalEnrolled"
                    stroke={chartColors.open}
                    name="Enrolled"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                />
                <Line
                    type="monotone"
                    dataKey="maxCapacity"
                    stroke={chartColors.full}
                    name="Capacity"
                    strokeWidth={2}
                    strokeDasharray="16 24"
                    dot={false}
                    activeDot={{ r: 3 }}
                    isAnimationActive={false}
                />
                <Line
                    type="monotone"
                    dataKey="waitlist"
                    stroke={chartColors.waitlist}
                    name="Waitlist"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    activeDot={{ r: 3 }}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
