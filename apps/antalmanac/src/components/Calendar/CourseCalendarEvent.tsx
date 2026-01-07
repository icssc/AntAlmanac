import { Delete, Search } from '@mui/icons-material';
import { Chip, IconButton, Paper, Tooltip, Button, Box } from '@mui/material';
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
                            <td style={{ textAlign: 'right' }}>{term}</td>
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
                                    isCustomEvent={selectedEvent.isCustomEvent}
                                    sectionCode={selectedEvent.sectionCode}
                                    term={selectedEvent.term}
                                    analyticsCategory={analyticsEnum.calendar}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Paper>
        );
    } else {
        const { term, title, customEventID, building } = selectedEvent;
        return (
            <Paper sx={{ padding: '0.5rem' }} ref={paperRef}>
                <Box sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{title}</Box>
                <table style={{ border: 'none', width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <tbody>
                        {
                            <tr>
                                <td style={{ verticalAlign: 'top', paddingRight: '2rem' }}>Term</td>
                                <td style={{ textAlign: 'right' }}>{term}</td>
                            </tr>
                        }
                        {building && (
                            <tr>
                                <td style={{ verticalAlign: 'top', paddingRight: '2rem' }}>Location</td>
                                <td style={{ textAlign: 'right' }}>
                                    {<MapLink buildingId={+building} room={buildingCatalogue[+building]?.name ?? ''} />}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
