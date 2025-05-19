import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

interface DaySelectorProps {
    days?: boolean[];
    onSelectDay: (days: boolean[]) => void;
}

export function DaySelector({
    days = [false, false, false, false, false, false, false],
    onSelectDay,
}: DaySelectorProps) {
    const daysValue = days.map((day, index) => (day ? DAYS.at(index) : false)).filter(Boolean);

    const handleChange = (_event: unknown, value: typeof DAYS) => {
        const newDays = DAYS.map((d) => value.includes(d));
        onSelectDay(newDays);
    };

    return (
        <ToggleButtonGroup value={daysValue} onChange={handleChange} fullWidth>
            {DAYS.map((day) => (
                <ToggleButton key={day} value={day}>
                    {day.at(0)}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
