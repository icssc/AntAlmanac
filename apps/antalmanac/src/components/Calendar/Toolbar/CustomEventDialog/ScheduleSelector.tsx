import { Box, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';
import { useCallback } from 'react';

import AppStore from '$stores/AppStore';

interface ScheduleSelectorProps {
    scheduleIndices: number[];
    onSelectScheduleIndices: (scheduleIndices: number[]) => void;
}

export function ScheduleSelector({ scheduleIndices, onSelectScheduleIndices }: ScheduleSelectorProps) {
    const scheduleNames = AppStore.getScheduleNames();

    const handleChange = useCallback((event: SelectChangeEvent<number[]>) => {
        const value = event.target.value as number[];
        onSelectScheduleIndices(value);
    }, []);

    return (
        <FormControl style={{ maxWidth: 400 }} fullWidth variant="outlined">
            <InputLabel id="schedule-select-label" htmlFor="select-multiple-chip">
                Schedules
            </InputLabel>

            <Select
                labelId="schedule-select-label"
                id="schedule-select"
                size="small"
                multiple
                value={scheduleIndices}
                defaultValue={scheduleIndices}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value: number) => {
                            return <Chip key={value} label={scheduleNames.at(value)} />;
                        })}
                    </Box>
                )}
            >
                {scheduleNames.map((name: string, index: number) => {
                    return (
                        <MenuItem key={index} value={index}>
                            {name}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
