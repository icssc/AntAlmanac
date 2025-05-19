import { Button, Box } from '@mui/material';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

interface DaySelectorProps {
    days?: boolean[];
    onSelectDay: (days: boolean[]) => void;
}

export function DaySelector({
    days = [false, false, false, false, false, false, false],
    onSelectDay,
}: DaySelectorProps) {
    const handleChange = (dayIndex: number) => {
        const newDays = [...days];
        newDays[dayIndex] = !newDays[dayIndex];
        onSelectDay(newDays);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}
            style={{ gap: '12px' }}
        >
            {DAYS.map((day, index) => (
                <Button
                    key={index}
                    variant={days.at(index) ? 'contained' : 'outlined'}
                    size="small"
                    color="secondary"
                    fullWidth
                    onClick={() => handleChange(index)}
                    sx={{
                        display: 'block',
                        aspectRatio: 1 / 1,
                        minWidth: 20,
                        minHeight: 40,
                    }}
                >
                    {day.at(0)}
                </Button>
            ))}
        </Box>
    );
}
