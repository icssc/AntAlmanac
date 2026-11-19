import { deleteCourse, deleteCustomEvent } from '$actions/AppStoreActions';
import { MapLink } from '$components/buttons/MapLink';
import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { type CourseEvent, type CustomEvent, isCourseEvent } from '$components/Calendar/types';
import { ColorPicker } from '$components/ColorPicker';
import { useCurrentCustomEvent } from '$hooks/useCurrentCustomEvent';
import { useQuickSearch } from '$hooks/useQuickSearch';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { clickToCopy } from '$lib/helpers';
import buildingCatalogue from '$lib/locations/buildingCatalogue';
import locationIds from '$lib/locations/locations';
import AppStore from '$stores/AppStore';
import { calendarizeCustomEvents, formatTimes } from '$stores/calendarizeHelpers';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { Delete, Search } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, Paper, Tooltip } from '@mui/material';
import type { CustomEventId } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useRef } from 'react';

interface CalendarEventDetailProps {
    selectedEvent: CourseEvent | CustomEvent;
    closePopover: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function CalendarEventDetail({ selectedEvent, closePopover }: CalendarEventDetailProps) {
    const paperRef = useRef<HTMLDivElement>(null);
    const quickSearch = useQuickSearch();
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);

    const postHog = usePostHog();

    if (isCourseEvent(selectedEvent)) {
        const { term, instructors, sectionCode, title, finalExam, locations, sectionType, deptValue, courseNumber } =
            selectedEvent;

        let finalExamString = '';

        if (finalExam.examStatus == 'NO_FINAL') {
            finalExamString = 'No Final';
        } else if (finalExam.examStatus == 'TBA_FINAL') {
            finalExamString = 'Final TBA';
        } else {
            if (finalExam.examStatus === 'SCHEDULED_FINAL') {
                const timeString = formatTimes(finalExam.startTime, finalExam.endTime, isMilitaryTime);
                const locationString = `at ${finalExam.locations
                    .map((location) => `${location.building} ${location.room}`)
                    .join(', ')}`;
                const finalExamMonth = MONTHS[finalExam.month];

                finalExamString = `${finalExam.dayOfWeek} ${finalExamMonth} ${finalExam.day} ${timeString} ${locationString}`;
            }
        }

        const handleQuickSearch = () => {
            quickSearch(deptValue, courseNumber, term);
        };

        return (
            <Paper sx={{ padding: '0.5rem', minWidth: '15rem' }} ref={paperRef}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.25rem',
                    }}
                >
                    <Tooltip title="Quick Search (or CMD/CTRL + Click event)">
                        <Button size="small" color="secondary" onClick={handleQuickSearch}>
                            <Search fontSize="small" style={{ marginRight: 5 }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{`${title} ${sectionType}`}</span>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            style={{ textDecoration: 'underline' }}
                            onClick={() => {
                                closePopover();
                                deleteCourse(sectionCode, term, AppStore.getCurrentScheduleIndex());
                                logAnalytics(postHog, {
                                    category: analyticsEnum.calendar,
                                    action: analyticsEnum.calendar.actions.DELETE_COURSE,
                                });
                            }}
                        >
                            <Delete fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <table style={{ border: 'none', width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <tbody>
                        <tr>
                            <td style={{ verticalAlign: 'top' }}>Section code</td>
                            <Tooltip title="Click to copy section code" placement="right">
                                <td style={{ textAlign: 'right' }}>
                                    <Chip
                                        onClick={(event) => {
                                            clickToCopy(event, sectionCode);
                                            logAnalytics(postHog, {
                                                category: analyticsEnum.calendar,
                                                action: analyticsEnum.calendar.actions.COPY_COURSE_CODE,
                                            });
                                        }}
                                        label={sectionCode}
                                        size="small"
                                    />
                                </td>
                            </Tooltip>
                        </tr>
                        <tr>
                            <td style={{ verticalAlign: 'top' }}>Term</td>
                            <td style={{ textAlign: 'right' }}>{term.shortName}</td>
                        </tr>
                        <tr>
                            <td style={{ verticalAlign: 'top' }}>Instructors</td>
                            <td style={{ whiteSpace: 'pre', textAlign: 'right' }}>{instructors.join('\n')}</td>
                        </tr>
                        <tr>
                            <td style={{ verticalAlign: 'top' }}>Location{locations.length > 1 && 's'}</td>
                            <td style={{ whiteSpace: 'pre', textAlign: 'right' }}>
                                {locations.map((location) => (
                                    <div key={`${sectionCode} @ ${location.building} ${location.room}`}>
                                        <MapLink
                                            buildingId={locationIds[location.building] ?? '0'}
                                            room={`${location.building} ${location.room}`}
                                        />
                                    </div>
                                ))}
                            </td>
                        </tr>
                        <tr>
                            <td>Final</td>
                            <td style={{ textAlign: 'right' }}>{finalExamString}</td>
                        </tr>
                        <tr>
                            <td>Color</td>
                            <td style={{ textAlign: 'right' }}>
                                <ColorPicker
                                    color={selectedEvent.color}
                                    isCustomEvent={false}
                                    sectionCode={sectionCode}
                                    term={term}
                                    analyticsCategory={analyticsEnum.calendar}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Paper>
        );
    }

    return (
        <CustomEventDetail
            customEventID={selectedEvent.customEventID}
            day={selectedEvent.start.getDay()}
            closePopover={closePopover}
        />
    );
}

interface CustomEventDetailProps {
    customEventID: CustomEventId;
    day: number;
    closePopover: () => void;
}

function CustomEventDetail({ customEventID, day, closePopover }: CustomEventDetailProps) {
    const customEvent = useCurrentCustomEvent(customEventID);
    const postHog = usePostHog();
    const isTileShown =
        !!customEvent && calendarizeCustomEvents([customEvent]).some((event) => event.start.getDay() === day);

    useEffect(() => {
        if (!isTileShown) {
            closePopover();
        }
    }, [isTileShown, closePopover]);

    if (!customEvent || !isTileShown) {
        return null;
    }

    const { title, building, notes } = customEvent;
    const scheduleNames = AppStore.getScheduleNames();
    const linkedScheduleNames = AppStore.schedule
        .getIndexesOfCustomEvent(customEventID)
        .map((scheduleIndex) => scheduleNames[scheduleIndex]);

    return (
        <Paper sx={{ padding: '0.5rem', minWidth: '15rem', maxWidth: '25rem', overflowWrap: 'break-word' }}>
            <Box sx={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</Box>
            <table style={{ border: 'none', width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <tbody>
                    {building && (
                        <tr>
                            <td style={{ verticalAlign: 'top' }}>Location</td>
                            <td style={{ textAlign: 'right' }}>
                                <MapLink buildingId={+building} room={buildingCatalogue[+building]?.name ?? ''} />
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td style={{ verticalAlign: 'top' }}>Schedule{linkedScheduleNames.length > 1 && 's'}</td>
                        <td style={{ whiteSpace: 'pre-line', textAlign: 'right' }}>{linkedScheduleNames.join('\n')}</td>
                    </tr>
                </tbody>
            </table>
            {notes && <Box sx={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{notes}</Box>}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ColorPicker
                    color={customEvent.color ?? '#000000'}
                    isCustomEvent={true}
                    customEventID={customEventID}
                    analyticsCategory={analyticsEnum.calendar}
                />
                <CustomEventDialog customEvent={AppStore.schedule.getExistingCustomEvent(customEventID)} />

                <Tooltip title="Delete">
                    <IconButton
                        sx={{ padding: 0.5 }}
                        onClick={() => {
                            closePopover();
                            deleteCustomEvent(customEventID, [AppStore.getCurrentScheduleIndex()]);
                            logAnalytics(postHog, {
                                category: analyticsEnum.calendar,
                                action: analyticsEnum.calendar.actions.DELETE_CUSTOM_EVENT,
                            });
                        }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
}
