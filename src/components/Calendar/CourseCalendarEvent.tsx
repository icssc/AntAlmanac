import { IconButton, Paper, Tooltip } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Delete } from '@material-ui/icons';
import { Event } from 'react-big-calendar';

import { deleteCourse, deleteCustomEvent } from '$actions/AppStoreActions';
import ColorPicker from '$components/ColorPicker';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy, isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';

import RightPaneStore, { BuildingFocusInfo } from '../RightPane/RightPaneStore';
import CustomEventDialog from './Toolbar/CustomEventDialog/CustomEventDialog';

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
    },
};

const selectBuilding = (buildingFocusInfo: BuildingFocusInfo) => {
    if (buildingFocusInfo.location !== 'TBA') {
        RightPaneStore.focusOnBuilding(buildingFocusInfo);
    }
};

interface CommonCalendarEvent extends Event {
    color: string;
    start: Date;
    end: Date;
    title: string;
}

export interface CourseEvent extends CommonCalendarEvent {
    bldg: string; // E.g., ICS 174, which is actually building + room
    finalExam: string;
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

const CourseCalendarEvent = (props: CourseCalendarEventProps) => {
    const { classes, courseInMoreInfo } = props;
    if (!courseInMoreInfo.isCustomEvent) {
        const { term, instructors, sectionCode, title, finalExam, bldg } = courseInMoreInfo;

        return (
            <Paper className={classes.courseContainer}>
                <div className={classes.titleBar}>
                    <span className={classes.title}>{title}</span>
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
                                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                <td
                                    onClick={(e) => {
                                        logAnalytics({
                                            category: analyticsEnum.calendar.title,
                                            action: analyticsEnum.calendar.actions.COPY_COURSE_CODE,
                                        });
                                        clickToCopy(e, sectionCode);
                                    }}
                                    className={classes.rightCells}
                                >
                                    <u>{sectionCode}</u>
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
                            <td className={classes.alignToTop}>Location</td>
                            <td className={`${classes.multiline} ${classes.rightCells}`}>
                                <button
                                    className={classes.clickableLocation}
                                    onClick={() => selectBuilding({ location: bldg, courseName: title })}
                                >
                                    {bldg}
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>Final</td>
                            <td className={classes.rightCells}>{finalExam}</td>
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
            <Paper className={classes.customEventContainer} onClick={(event) => event.stopPropagation()}>
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
