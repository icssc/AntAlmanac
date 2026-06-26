import { Box, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@mui/material';
import { type ShortCourseSchedule } from '@packages/antalmanac-types';

interface ScheduleListProps {
    schedules: ShortCourseSchedule[];
    selectedIndices: Set<number>;
    onSelectedIndicesChange: (indices: Set<number>) => void;
}

export function ScheduleList({ schedules, selectedIndices, onSelectedIndicesChange }: ScheduleListProps) {
    return (
        <>
            <FormControlLabel
                control={
                    <Checkbox
                        color="secondary"
                        checked={selectedIndices.size === schedules.length && schedules.length > 0}
                        indeterminate={selectedIndices.size > 0 && selectedIndices.size < schedules.length}
                        onChange={() => {
                            if (selectedIndices.size === schedules.length) {
                                onSelectedIndicesChange(new Set());
                            } else {
                                onSelectedIndicesChange(new Set(schedules.map((_, index) => index)));
                            }
                        }}
                    />
                }
                label={
                    <Typography variant="subtitle2" fontWeight="medium">
                        Select All ({selectedIndices.size} of {schedules.length})
                    </Typography>
                }
                sx={{ marginBottom: 1 }}
            />
            <Box
                sx={(theme) => ({
                    maxHeight: 300,
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: theme.vars.palette.divider,
                    borderRadius: 1,
                    p: 1,
                })}
            >
                <Stack spacing={1}>
                    {schedules.map((schedule, index) => (
                        <Paper
                            key={index}
                            sx={(theme) => ({
                                p: 1.5,
                                border: '2px solid',
                                borderColor: selectedIndices.has(index)
                                    ? theme.vars.palette.secondary.main
                                    : 'transparent',
                                backgroundColor: selectedIndices.has(index)
                                    ? theme.vars.palette.action.selected
                                    : theme.vars.palette.background.paper,
                                transition: 'all 0.2s ease-in-out',
                            })}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="secondary"
                                        checked={selectedIndices.has(index)}
                                        onChange={() => {
                                            const newSet = new Set(selectedIndices);
                                            if (newSet.has(index)) {
                                                newSet.delete(index);
                                            } else {
                                                newSet.add(index);
                                            }
                                            onSelectedIndicesChange(newSet);
                                        }}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {schedule.scheduleName}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: (theme) => theme.vars.palette.text.secondary }}
                                        >
                                            {schedule.courses.length} course(s), {schedule.customEvents.length} custom
                                            event(s)
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Paper>
                    ))}
                </Stack>
            </Box>
        </>
    );
}
