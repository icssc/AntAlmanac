import { Button, Box } from '@material-ui/core';
import { useEffect, useState } from 'react';

const normal_days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySelectorProps {
    days?: boolean[];
    onSelectDay: (days: boolean[]) => void;
}

const DaySelector = ({ days = [false, false, false, false, false, false, false], onSelectDay }: DaySelectorProps) => {
    const [selectedDays, setSelectedDays] = useState(days);

    useEffect(() => {
        onSelectDay(selectedDays);
    }, [onSelectDay, selectedDays]);

    const handleChange = (dayIndex: number) => {
        const newSelectedDays = [...selectedDays];
        newSelectedDays[dayIndex] = !selectedDays[dayIndex];
        setSelectedDays(newSelectedDays);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 12,
                marginBottom: 12,
            }}
            style={{ gap: '12px' }}
        >
            {normal_days.map((day, index) => (
                <Button
                    key={index}
                    variant={selectedDays[index] ? 'contained' : 'outlined'}
                    size="small"
                    fullWidth
                    onClick={() => handleChange(index)}
                    color={'default'}
                    style={{
                        display: 'block',
                        aspectRatio: 1 / 1,
                        minWidth: 20,
                        minHeight: 40,
                    }}
                >
                    {day[0]}
                </Button>
            ))}
        </Box>
    );
};

export default DaySelector;
