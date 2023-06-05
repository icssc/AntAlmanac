import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useEffect, useState } from 'react';

const normal_days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const abbreviated_days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

interface DaySelectorProps {
    days?: boolean[];
    onSelectDay: (days: boolean[]) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({
    days = [false, false, false, false, false, false, false],
    onSelectDay,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedDays, setSelectedDays] = useState(days);

    useEffect(() => {
        onSelectDay(selectedDays);
    }, [selectedDays]);

    const handleChange = (dayIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDays((prevDays) => {
            prevDays[dayIndex] = event.target.checked;
            return prevDays;
        });
    };

    const dayNames = isMobile ? abbreviated_days : normal_days;

    return (
        <FormGroup row>
            {dayNames.map((day, index) => (
                <FormControlLabel
                    key={index}
                    control={
                        <Checkbox
                            checked={selectedDays[index]}
                            onChange={handleChange(index)}
                            value={index}
                            color="primary"
                        />
                    }
                    label={day}
                />
            ))}
        </FormGroup>
    );
};

export default DaySelector;
