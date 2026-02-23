import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";

interface ScheduleSelectorProps {
    scheduleIndices: number[];
    onSelectScheduleIndices: (scheduleIndices: number[]) => void;
    scheduleNames: string[];
}

export function ScheduleSelector({
    scheduleIndices,
    onSelectScheduleIndices,
    scheduleNames,
}: ScheduleSelectorProps) {
    const handleChange = (event: SelectChangeEvent<typeof scheduleIndices>) => {
        const value = event.target.value;

        if (typeof value === "string") {
            return;
        }

        onSelectScheduleIndices(value);
    };

    return (
        <FormControl style={{ maxWidth: 400 }} fullWidth>
            <InputLabel variant="outlined">Select schedules</InputLabel>
            <Select
                variant="outlined"
                label="Select schedules"
                multiple
                value={scheduleIndices}
                onChange={handleChange}
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
