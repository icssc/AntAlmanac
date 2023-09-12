import { Link } from 'react-router-dom';
import { Chip, IconButton, Paper, Tooltip } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Delete } from '@material-ui/icons';
import { Event } from 'react-big-calendar';
import { useEffect, useRef, useCallback } from 'react';

import CustomEventDialog from './Toolbar/CustomEventDialog/CustomEventDialog';
import { deleteCourse, deleteCustomEvent } from '$actions/AppStoreActions';
import ColorPicker from '$components/ColorPicker';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy, isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';
import locationIds from '$lib/location_ids';
import { useTabStore } from '$stores/TabStore';
import { translate24To12HourTime } from '$stores/calendarizeHelpers';

const styles: Styles<Theme, object> = {
    courseContainer: {
        padding: '0.5rem',
        margin: '0 1rem',
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
        color: isDarkMode() ? '#1cbeff' : 'blue',
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
    days?: string[];
}

export interface CourseEvent extends CommonCalendarEvent {
    bldg: Location[];
    finalExam: {
        examStatus: 'NO_FINAL' | 'TBA_FINAL' | 'SCHEDULED_FINAL';
        dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | null;
        month: number | null;
        day: number | null;
        startTime: {
            hour: number;
            minute: number;
        } | null;
        endTime: {
            hour: number;
            minute: number;
        } | null;
        bldg: string[] | null;
    };
    courseTitle: string;
    instructors: string[];
    isCustomEvent: false;
    sectionCode: string;
    sectionType: string;
    term: string;
}

/**
 * There is another CustomEvent interface in CourseCalendarEvent and they are slightly different.  The this one represents only one day, like the event on Monday, and needs to be duplicated to be repeated across multiple days. The other one, `CustomEventDialog`'s `RepeatingCustomEvent`, encapsulates the occurences of an event on multiple days, like Monday Tuesday Wednesday all in the same object as specified by the `days` array.
 * https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F
 */
export interface CustomEvent extends CommonCalendarEvent {
    customEventID: number;
    isCustomEvent: true;
}

export type CalendarEvent = CourseEvent | CustomEvent;

interface CourseCalendarEventProps {
    classes: ClassNameMap;
    courseInMoreInfo: CalendarEvent;
    scheduleNames: string[];
    closePopover: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CourseCalendarEvent = (props: CourseCalendarEventProps) => {
    const paperRef = useRef<HTMLInputElement>(null);

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

    const { setActiveTab } = useTabStore();

    const focusMap = useCallback(() => {
        setActiveTab(2);
    }, [setActiveTab]);

    const { classes, courseInMoreInfo } = props;

    if (!courseInMoreInfo.isCustomEvent) {
        const { term, instructors, sectionCode, title, finalExam, bldg, sectionType } = courseInMoreInfo;

        let finalExamString = '';

        if (finalExam.examStatus == 'NO_FINAL') {
            finalExamString = 'No Final';
        } else if (finalExam.examStatus == 'TBA_FINAL') {
            finalExamString = 'Final TBA';
        } else {
            if (finalExam.startTime && finalExam.endTime && finalExam.month && finalExam.bldg) {
                const timeString = translate24To12HourTime(finalExam.startTime, finalExam.endTime);
                const locationString = `at ${finalExam.bldg.join(', ')}`;
                const finalExamMonth = MONTHS[finalExam.month];

                finalExamString = `${finalExam.dayOfWeek} ${finalExamMonth} ${finalExam.day} ${timeString} ${locationString}`;
            }
        }

        return (
            <Paper className={classes.courseContainer} ref={paperRef}>
                <div className={classes.titleBar}>
                    <span className={classes.title}>{`${title} ${sectionType}`}</span>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={() => {
                                deleteCourse(sectionCode, term);
                                logAnalytics({
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
                                            logAnalytics({
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
                            <td className={classes.alignToTop}>Location{bldg.length > 1 && 's'}</td>
                            <td className={`${classes.multiline} ${classes.rightCells}`}>
                                {bldg.map((location) => (
                                    <div key={`${sectionCode} @ ${location.building} ${location.room}`}>
                                        <Link
                                            className={classes.clickableLocation}
                                            to={`/map?location=${locationIds[location.building] ?? 0}`}
                                            onClick={focusMap}
                                        >
                                            {location.building} {location.room}
                                        </Link>
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
                                    color={courseInMoreInfo.color}
                                    isCustomEvent={courseInMoreInfo.isCustomEvent}
                                    sectionCode={courseInMoreInfo.sectionCode}
                                    term={courseInMoreInfo.term}
                                    analyticsCategory={analyticsEnum.calendar.title}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Paper>
        );
    } else {
        const { title, customEventID } = courseInMoreInfo;
        return (
            <Paper className={classes.customEventContainer} ref={paperRef}>
                <div className={classes.title}>{title}</div>
                <div className={classes.buttonBar}>
                    <div className={`${classes.colorPicker}`}>
                        <ColorPicker
                            color={courseInMoreInfo.color}
                            isCustomEvent={true}
                            customEventID={courseInMoreInfo.customEventID}
                            analyticsCategory={analyticsEnum.calendar.title}
                        />
                    </div>
                    <CustomEventDialog
                        onDialogClose={props.closePopover}
                        customEvent={AppStore.schedule.getExistingCustomEvent(customEventID)}
                        scheduleNames={props.scheduleNames}
                    />

                    <Tooltip title="Delete">
                        <IconButton
                            onClick={() => {
                                props.closePopover();
                                deleteCustomEvent(customEventID);
                                logAnalytics({
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
