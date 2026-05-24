import buildingCatalogue from '$lib/locations/buildingCatalogue';
import FriendsStore from '$stores/FriendsStore';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { Box, Card, CardContent, CardHeader, Chip, Paper, TextField, Typography } from '@mui/material';
import type { ScheduleCourse } from '@packages/antalmanac-types';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { format, isValid, set } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

function formatCustomEventTime(customEvent: RepeatingCustomEvent, isMilitaryTime: boolean) {
    const baseDate = new Date(2000, 0, 1);
    const startTime = set(baseDate, {
        hours: parseInt(customEvent.start.slice(0, 2)),
        minutes: parseInt(customEvent.start.slice(3, 5)),
    });
    const endTime = set(baseDate, {
        hours: parseInt(customEvent.end.slice(0, 2)),
        minutes: parseInt(customEvent.end.slice(3, 5)),
    });

    if (!isValid(startTime) || !isValid(endTime)) {
        return `${customEvent.start} — ${customEvent.end}`;
    }

    const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysString = customEvent.days
        .map((includeDate, index) => (includeDate ? dayAbbreviations[index] : ''))
        .join(' ');

    const timeFormat = isMilitaryTime ? 'HH:mm' : 'h:mm a';
    return `${format(startTime, timeFormat)} — ${format(endTime, timeFormat)} • ${daysString}`;
}

function FriendCourseRow({ course }: { course: ScheduleCourse }) {
    return (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
                {course.deptCode} {course.courseNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {course.courseTitle}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                <Chip size="small" label={course.section.sectionCode} />
                <Chip size="small" label={course.section.sectionType} />
            </Box>
        </Paper>
    );
}

export function FriendSchedule() {
    const [courses, setCourses] = useState(() => FriendsStore.schedule.getCurrentCourses());
    const [customEvents, setCustomEvents] = useState(() => FriendsStore.schedule.getCurrentCustomEvents());
    const [scheduleNote, setScheduleNote] = useState(() => FriendsStore.getCurrentFriendSchedule().scheduleNote ?? '');
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);

    const syncFromStore = useCallback(() => {
        setCourses(FriendsStore.schedule.getCurrentCourses());
        setCustomEvents(FriendsStore.schedule.getCurrentCustomEvents());
        setScheduleNote(FriendsStore.getCurrentFriendSchedule().scheduleNote ?? '');
    }, []);

    useEffect(() => {
        FriendsStore.on('scheduleChange', syncFromStore);
        FriendsStore.on('friendViewChange', syncFromStore);

        return () => {
            FriendsStore.off('scheduleChange', syncFromStore);
            FriendsStore.off('friendViewChange', syncFromStore);
        };
    }, [syncFromStore]);

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Added Courses</Typography>

            {courses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No courses in this schedule.
                </Typography>
            ) : (
                <Box display="flex" flexDirection="column" gap={1}>
                    {courses.map((course) => (
                        <FriendCourseRow key={course.section.sectionCode} course={course} />
                    ))}
                </Box>
            )}

            {customEvents.length > 0 && (
                <>
                    <Typography variant="h6">Custom Events</Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                        {customEvents.map((customEvent) => (
                            <Card key={customEvent.customEventID}>
                                <CardHeader
                                    title={customEvent.title}
                                    slotProps={{ title: { variant: 'subtitle1' } }}
                                    subheader={formatCustomEventTime(customEvent, isMilitaryTime)}
                                    sx={{ padding: 1 }}
                                />
                                {customEvent.building != null && customEvent.building !== '' && (
                                    <CardContent sx={{ paddingX: 1, paddingY: 0 }}>
                                        {buildingCatalogue[+customEvent.building]?.name ?? customEvent.building}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </Box>
                </>
            )}

            {scheduleNote.length > 0 && (
                <Box>
                    <Typography variant="h6">Schedule Notes</Typography>
                    <TextField
                        value={scheduleNote}
                        multiline
                        fullWidth
                        disabled
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                    />
                </Box>
            )}
        </Box>
    );
}
