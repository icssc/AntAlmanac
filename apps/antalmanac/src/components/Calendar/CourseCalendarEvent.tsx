import { Chip, IconButton, Paper, Tooltip, Button } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Delete, Search } from '@material-ui/icons';
import { WebsocSectionFinalExam } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useRef } from 'react';
import { Event } from 'react-big-calendar';

import { deleteCourse, deleteCustomEvent } from '$actions/AppStoreActions';
import CustomEventDialog from '$components/Calendar/Toolbar/CustomEventDialog/';
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

const styles: Styles<Theme, object> = {
    courseContainer: {
        padding: '0.5rem',
        minWidth: '15rem',
    },
    customEventContainer: {
        padding: '0.5rem',
    },
    buttonBar: {
        display: 'flex',
        alignItems: 'center',
    },
    title: {
        fontSize: '0.9rem',
        fontWeight: 500,
    },
    icon: {
        cursor: 'pointer',
    },
    titleBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.25rem',
    },
    table: {
        border: 'none',
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9rem',
    },
    alignToTop: {
        verticalAlign: 'top',
    },
    rightCells: {
        textAlign: 'right',
    },
    multiline: {
        whiteSpace: 'pre',
    },
    stickToRight: {
        float: 'right',
    },
    colorPicker: {
        cursor: 'pointer',
        '& > div': {
            margin: '0px 8px 0px 4px',
            height: '20px',
            width: '20px',
            borderRadius: '50%',
        },
    },

    clickableLocation: {
        cursor: 'pointer',
        background: 'none !important',
        border: 'none',
        padding: '0 !important',
        fontSize: 'inherit',
        textDecoration: 'none',
    },
};

interface CommonCalendarEvent extends Event {
    color: string;
    start: Date;
    end: Date;
    title: string;
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
    term: string;
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

export type CalendarEvent = CourseEvent | CustomEvent;

interface CourseCalendarEventProps {
    classes: ClassNameMap;
    selectedEvent: CalendarEvent;
    scheduleNames: string[];
    closePopover: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CourseCalendarEvent = ({ classes, selectedEvent, scheduleNames, closePopover }: CourseCalendarEventProps) => {
    const paperRef = useRef<HTMLInputElement>(null);
    const quickSearch = useQuickSearch();
    const { isMilitaryTime } = useTimeFormatStore();

    const postHog = usePostHog();

    useEffect(() => {
        const handleKeyDown = (event: { keyCode: number }) => {
            // event.keyCode === 27 reads for the "escape" key
            if (event.keyCode === 27) {
                if (paperRef.current) paperRef.current.style.display = 'none';
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

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
            <Paper className={classes.courseContainer} ref={paperRef}>
                <div className={classes.titleBar}>
                    <Tooltip title="Quick Search">
                        <Button size="small" onClick={handleQuickSearch}>
                            <Search fontSize="small" style={{ marginRight: 5 }} />
                            <span className={classes.title}>{`${title} ${sectionType}`}</span>
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
                                    category: analyticsEnum.calendar.title,
                                    action: analyticsEnum.calendar.actions.DELETE_COURSE,
                                });
                            }}
                        >
                            <Delete fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </div>
                <table className={classes.table}>
                    <tbody>
                        <tr>
                            <td className={classes.alignToTop}>Section code</td>
                            <Tooltip title="Click to copy course code" placement="right">
                                <td className={classes.rightCells}>
                                    <Chip
                                        onClick={(event) => {
                                            clickToCopy(event, sectionCode);
                                            logAnalytics(postHog, {
                                                category: analyticsEnum.classSearch.title,
                                                action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
                                            });
                                        }}
                                        className={classes.sectionCode}
                                        label={sectionCode}
                                        size="small"
                                    />
                                </td>
                            </Tooltip>
                        </tr>
                        <tr>
                            <td className={classes.alignToTop}>Term</td>
                            <td className={classes.rightCells}>{term}</td>
                        </tr>
                        <tr>
                            <td className={classes.alignToTop}>Instructors</td>
                            <td className={`${classes.multiline} ${classes.rightCells}`}>{instructors.join('\n')}</td>
                        </tr>
                        <tr>
                            <td className={classes.alignToTop}>Location{locations.length > 1 && 's'}</td>
                            <td className={`${classes.multiline} ${classes.rightCells}`}>
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
                            <td className={classes.rightCells}>{finalExamString}</td>
                        </tr>
                        <tr>
                            <td>Color</td>
                            <td className={`${classes.colorPicker} ${classes.stickToRight}`}>
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
        const { title, customEventID, building } = selectedEvent;
        return (
            <Paper className={classes.customEventContainer} ref={paperRef}>
                <div className={classes.title}>{title}</div>
                {building && (
                    <div className={classes.table}>
                        Location:&nbsp;
                        <MapLink buildingId={+building} room={buildingCatalogue[+building]?.name ?? ''} />
                    </div>
                )}
                <div className={classes.buttonBar}>
                    <div className={`${classes.colorPicker}`}>
                        <ColorPicker
                            color={selectedEvent.color}
                            isCustomEvent={true}
                            customEventID={selectedEvent.customEventID}
                            analyticsCategory={analyticsEnum.calendar}
                        />
                    </div>
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
                                    category: analyticsEnum.calendar.title,
                                    action: analyticsEnum.calendar.actions.DELETE_CUSTOM_EVENT,
                                });
                            }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            </Paper>
        );
    }
};

export default withStyles(styles)(CourseCalendarEvent);
