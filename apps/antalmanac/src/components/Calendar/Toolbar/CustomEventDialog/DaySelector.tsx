import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useCallback } from 'react';

const DAYS_LIST = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySelectorProps {
    days: boolean[];
    onSelectDay: (days: boolean[]) => void;
}

const DaySelector = ({ days, onSelectDay }: DaySelectorProps) => {
    const selectedDays = DAYS_LIST.filter((_, i) => days[i]);

    const handleChange = useCallback((_: React.MouseEvent, newDays: string[]) => {
        onSelectDay(DAYS_LIST.map((i) => newDays.includes(i)));
    }, []);

    return (
        <ToggleButtonGroup value={selectedDays} onChange={handleChange} sx={{ minWidth: 350 }}>
            {DAYS_LIST.map((day) => (
                <ToggleButton key={day} value={day} sx={{ flexGrow: 1 }}>
                    {day.charAt(0)}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default DaySelector;
