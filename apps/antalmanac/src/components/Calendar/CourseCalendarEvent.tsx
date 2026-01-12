import { Delete, Search } from '@mui/icons-material';
import {
    Chip,
    IconButton,
    Paper,
    Tooltip,
    Button,
    Box,
    Table,
    TableBody,
    TableRow,
    TableCell,
    tableCellClasses,
} from '@mui/material';
import { WebsocSectionFinalExam } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useRef } from 'react';
import { Event } from 'react-big-calendar';

import { deleteCourse, deleteCustomEvent } from '$actions/AppStoreActions';
import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import ColorPicker from '$components/ColorPicker';
import { MapLink } from '$components/buttons/MapLink';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { clickToCopy } from '$lib/helpers';
import buildingCatalogue from '$lib/locations/buildingCatalogue';
import locationIds from '$lib/locations/locations';
import { useQuickSearch } from '$src/hooks/useQuickSearch';
import AppStore from '$stores/AppStore';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { formatTimes } from '$stores/calendarizeHelpers';

interface CommonCalendarEvent extends Event {
    color: string;
    start: Date;
    end: Date;
    title: string;
    term: string;
}

export interface Location {
    /**
     * @example 'ICS'
     */
    building: string;

    /**
     * @example '174'
     */
    room: string;

    /**
     * If the location only applies on specific days, this is non-null.
     */
    days?: string;
}

export type FinalExam =
    | (Omit<Extract<WebsocSectionFinalExam, { examStatus: 'SCHEDULED_FINAL' }>, 'bldg'> & { locations: Location[] })
    | Extract<WebsocSectionFinalExam, { examStatus: 'NO_FINAL' | 'TBA_FINAL' }>;

export interface CourseEvent extends CommonCalendarEvent {
    locations: Location[];
    showLocationInfo: boolean;
    finalExam: FinalExam;
    courseTitle: string;
    instructors: string[];
    isCustomEvent: false;
    sectionCode: string;
    sectionType: string;
    deptValue: string;
    courseNumber: string;
}

/**
 * There is another CustomEvent interface in CourseCalendarEvent and they are slightly different.  The this one represents only one day, like the event on Monday, and needs to be duplicated to be repeated across multiple days. The other one, `CustomEventDialog`'s `RepeatingCustomEvent`, encapsulates the occurrences of an event on multiple days, like Monday Tuesday Wednesday all in the same object as specified by the `days` array.
 * https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F
 */
export interface CustomEvent extends CommonCalendarEvent {
    customEventID: number;
    isCustomEvent: true;
    building: string;
    days: string[];
}

export interface SkeletonEvent extends CommonCalendarEvent {
    isSkeletonEvent: true;
}

export type CalendarEvent = CourseEvent | CustomEvent | SkeletonEvent;

export const isSkeletonEvent = (event: CalendarEvent): event is SkeletonEvent => {
    return 'isSkeletonEvent' in event && event.isSkeletonEvent;
};

interface CourseCalendarEventProps {
    selectedEvent: CourseEvent | CustomEvent;
    scheduleNames: string[];
    closePopover: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CourseCalendarEvent = ({ selectedEvent, scheduleNames, closePopover }: CourseCalendarEventProps) => {
    const paperRef = useRef<HTMLDivElement>(null);
    const quickSearch = useQuickSearch();
    const { isMilitaryTime } = useTimeFormatStore();

    const postHog = usePostHog();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closePopover();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [closePopover]);

    if (!selectedEvent.isCustomEvent) {
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
                    <Tooltip title="Quick Search">
                        <Button size="small" onClick={handleQuickSearch}>
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
                <Table
                    sx={{
                        [`& .${tableCellClasses.root}`]: {
                            p: 0,
                            pb: 0.5,
                            verticalAlign: 'top',
                            borderBottom: 'none',
                        },
                        border: 'none',
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.9rem',
                    }}
                >
                    <TableBody>
                        <TableRow>
                            <TableCell>Section code</TableCell>
                            <Tooltip title="Click to copy section code" placement="right">
                                <TableCell sx={{ textAlign: 'right' }}>
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
                                </TableCell>
                            </Tooltip>
                        </TableRow>
                        <TableRow>
                            <TableCell>Term</TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>{term}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Instructors</TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>{instructors.join('\n')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Location{locations.length > 1 && 's'}</TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                                {locations.map((location) => (
                                    <div key={`${sectionCode} @ ${location.building} ${location.room}`}>
                                        <MapLink
                                            buildingId={locationIds[location.building] ?? '0'}
                                            room={`${location.building} ${location.room}`}
                                        />
                                    </div>
                                ))}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Final</TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>{finalExamString}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{ paddingBottom: 0 }}>Color</TableCell>
                            <TableCell style={{ textAlign: 'right', paddingBottom: 0 }}>
                                <ColorPicker
                                    color={selectedEvent.color}
                                    isCustomEvent={selectedEvent.isCustomEvent}
                                    sectionCode={selectedEvent.sectionCode}
                                    term={selectedEvent.term}
                                    analyticsCategory={analyticsEnum.calendar}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
        );
    } else {
        const { term, title, customEventID, building } = selectedEvent;
        return (
            <Paper sx={{ padding: '0.5rem' }} ref={paperRef}>
                <Box sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{title}</Box>
                <Table
                    sx={{
                        [`& .${tableCellClasses.root}`]: {
                            p: 0,
                            pb: 0.5,
                            verticalAlign: 'top',
                            borderBottom: 'none',
                        },
                        border: 'none',
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.9rem',
                    }}
                >
                    <TableBody>
                        <TableRow>
                            <TableCell style={{ paddingRight: '2rem' }}>Term</TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>{term}</TableCell>
                        </TableRow>
                        {building && (
                            <TableRow>
                                <TableCell style={{ paddingRight: '2rem' }}>Location</TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>
                                    <MapLink buildingId={+building} room={buildingCatalogue[+building]?.name ?? ''} />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ColorPicker
                        color={selectedEvent.color}
                        isCustomEvent={true}
                        customEventID={selectedEvent.customEventID}
                        analyticsCategory={analyticsEnum.calendar}
                    />
                    <CustomEventDialog
                        onDialogClose={closePopover}
                        customEvent={AppStore.schedule.getExistingCustomEvent(customEventID)}
                        scheduleNames={scheduleNames}
                    />

                    <Tooltip title="Delete">
                        <IconButton
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
};
