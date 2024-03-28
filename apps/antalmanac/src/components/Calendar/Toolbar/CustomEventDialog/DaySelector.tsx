import { Button, Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useThemeStore } from '$stores/SettingsStore';

const normal_days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySelectorProps {
    days?: boolean[];
    onSelectDay: (days: boolean[]) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({
    days = [false, false, false, false, false, false, false],
    onSelectDay,
}) => {
    const [selectedDays, setSelectedDays] = useState(days);

    const { isDark } = useThemeStore();

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
                justifyContent: 'center',
                padding: 5,
            }}
        >
            {normal_days.map((day, index) => (
                <Button
                    key={index}
                    variant={selectedDays[index] ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                        handleChange(index);
                    }}
                    color={isDark ? 'default' : 'primary'}
                    style={{
                        margin: 5,
                        maxWidth: 40,
                        minWidth: 40,
                        aspectRatio: 1,
                    }}
                >
                    {day[0]}
                </Button>
            ))}
        </Box>
    );
};

export default DaySelector;
