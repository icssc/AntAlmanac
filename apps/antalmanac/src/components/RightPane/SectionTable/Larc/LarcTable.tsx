import { Box, TableCell, TableRow, Theme, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { WebsocSectionMeeting, CourseDetails, LarcAPIResponse } from '@packages/antalmanac-types';
import classNames from 'classnames';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { MOBILE_BREAKPOINT } from '../../../../globals';

import locationIds from '$lib/location_ids';
import AppStore from '$stores/AppStore';
import { useColumnStore, type SectionTableColumn } from '$stores/ColumnStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { usePreviewStore, useTimeFormatStore, useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';
import { normalizeTime, parseDaysString, formatTimes } from '$stores/calendarizeHelpers';

const styles: Styles<Theme, object> = (theme) => ({
    sectionCode: {
        display: 'inline-flex',
        cursor: 'pointer',
        '&:hover': {
            cursor: 'pointer',
        },
        alignSelf: 'center',
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    cell: {},
    link: {
        textDecoration: 'underline',
        cursor: 'pointer',
    },
    mapLink: {
        cursor: 'pointer',
        background: 'none !important',
        border: 'none',
        padding: '0 !important',
        fontSize: '0.85rem', // Not sure why this is not inherited
        textDecoration: 'none',
    },
    paper: {
        padding: theme.spacing(),
    },
    button: { padding: '6px' },
    open: {
        color: '#00c853',
    },
    waitl: {
        color: '#1c44b2',
    },
    full: {
        color: '#e53935',
    },
    Act: { color: '#c87137' },
    Col: { color: '#ff40b5' },
    Dis: { color: '#ff6e00' },
    Fld: { color: '#1ac805' },
    Lab: { color: '#1abbe9' },
    Lec: { color: '#d40000' },
    Qiz: { color: '#8e5c41' },
    Res: { color: '#ff2466' },
    Sem: { color: '#2155ff' },
    Stu: { color: '#179523' },
    Tap: { color: '#8d2df0' },
    Tut: { color: '#ffc705' },
    popoverText: {
        cursor: 'pointer',
    },
    codeCell: {
        width: '8%',
    },
    // statusCell: {
    //     width: '9%',
    // },
});

const NoPaddingTableCell = withStyles({
    sizeSmall: { padding: '0px 0px 0px 0px' },
})(TableCell);

type SectionType = 'Act' | 'Col' | 'Dis' | 'Fld' | 'Lab' | 'Lec' | 'Qiz' | 'Res' | 'Sem' | 'Stu' | 'Tap' | 'Tut';

interface SectionDetailCellProps {
    classes: ClassNameMap;
    sectionType: SectionType;
    sectionNum: string;
    units: number;
}

const SectionDetailsCell = withStyles(styles)((props: SectionDetailCellProps) => {
    const { classes, sectionType, sectionNum, units } = props;
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    return (
        <NoPaddingTableCell className={classes.cell} style={isMobileScreen ? { textAlign: 'center' } : {}}>
            <Box className={classes[sectionType]}>Larc</Box>
        </NoPaddingTableCell>
    );
});

interface InstructorsCellProps {
    classes: ClassNameMap;
    instructors: string[];
}

const InstructorsCell = withStyles(styles)((props: InstructorsCellProps) => {
    const { classes, instructors } = props;

    const getLinks = (professorNames: string[]) => {
        return professorNames.map((profName, index) => {
            if (profName !== 'STAFF') {
                const lastName = profName.substring(0, profName.indexOf(','));
                return (
                    <Box key={profName}>
                        <a
                            href={`https://www.ratemyprofessors.com/search/professors/1074?q=${lastName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {profName}
                        </a>
                    </Box>
                );
            } else {
                return <Box key={profName + index}> {profName} </Box>; // The key should be fine as we're not changing ['STAFF, 'STAFF']
            }
        });
    };

    return <NoPaddingTableCell className={classes.cell}>{getLinks(instructors)}</NoPaddingTableCell>;
});

interface LocationsCellProps {
    classes: ClassNameMap;
    meetings: WebsocSectionMeeting[];
    courseName: string; // Used in map pin popup
}

const LocationsCell = withStyles(styles)((props: LocationsCellProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    const { classes, meetings } = props;

    const { setActiveTab } = useTabStore();

    const focusMap = useCallback(() => {
        setActiveTab(2);
    }, [setActiveTab]);

    return (
        <NoPaddingTableCell className={classes.cell}>
            {meetings?.map((meeting) => {
                return !meeting.timeIsTBA ? (
                    meeting.bldg?.map((bldg) => {
                        const [buildingName = ''] = bldg.split(' ');
                        const buildingId = locationIds[buildingName];
                        return (
                            <Fragment key={meeting.timeIsTBA + bldg}>
                                <Link
                                    className={classes.mapLink}
                                    to={`/map?location=${buildingId}`}
                                    onClick={focusMap}
                                    color={isDark ? 'dodgerblue' : 'blue'}
                                >
                                    {bldg}
                                </Link>
                                <br />
                            </Fragment>
                        );
                    })
                ) : (
                    <Box>{'TBA'}</Box>
                );
            })}
        </NoPaddingTableCell>
    );
});

interface DayAndTimeCellProps {
    classes: ClassNameMap;
    meetings: WebsocSectionMeeting[];
}

const DayAndTimeCell = withStyles(styles)((props: DayAndTimeCellProps) => {
    const { classes, meetings } = props;

    const { isMilitaryTime } = useTimeFormatStore();

    return (
        <NoPaddingTableCell className={classes.cell}>
            {meetings?.map((meeting) => {
                if (meeting.timeIsTBA) {
                    return <Box key={meeting.timeIsTBA.toString()}>TBA</Box>;
                }

                if (meeting.startTime && meeting.endTime) {
                    const timeString = formatTimes(meeting.startTime, meeting.endTime, isMilitaryTime);

                    return <Box key={meeting.timeIsTBA + meeting.bldg[0]}>{`${meeting.days} ${timeString}`}</Box>;
                }

                return <Box>{meeting}</Box>;
            })}
        </NoPaddingTableCell>
    );
});

interface SectionTableBodyProps {
    classes: ClassNameMap;
    section: LarcAPIResponse[number];
    courseDetails: CourseDetails;
    term: string;
    allowHighlight: boolean;
    scheduleNames: string[];
}

// These components have too varied of types, any is fine here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableBodyCells: Record<
    Extract<SectionTableColumn, 'sectionDetails' | 'instructors' | 'dayAndTime' | 'location'>,
    React.ComponentType<any>
> = {
    sectionDetails: SectionDetailsCell,
    instructors: InstructorsCell,
    dayAndTime: DayAndTimeCell,
    location: LocationsCell,
};

export const LarcTable = withStyles(styles)((props: SectionTableBodyProps) => {
    const { classes, section, courseDetails, term, allowHighlight, scheduleNames } = props;

    const larcSectionKey = `${section.bldg}+${section.days}+${section.instructor}+${section.time}`;

    const isDark = useThemeStore((store) => store.isDark);
    const activeColumns = useColumnStore((store) => store.activeColumns);
    const previewMode = usePreviewStore((store) => store.previewMode);

    const [addedLarcSection, setAddedLarcSection] = useState(AppStore.getAddedSectionCodes().has(larcSectionKey));

    const [calendarEvents, setCalendarEvents] = useState(AppStore.getCourseEventsInCalendar());

    // ! time formatting is bad from API

    // /**
    //  * Additional information about the current section being rendered.
    //  * i.e. time information, which is compared with the calendar events to find conflicts.
    //  */
    // const sectionDetails = useMemo(() => {
    //     return {
    //         daysOccurring: parseDaysString(section.days),
    //         ...normalizeTime({startTime: section.time.split}),
    //     };
    // }, [section.meetings]);

    // Stable references to event listeners will synchronize React state with the store.

    const updateHighlight = useCallback(() => {
        setAddedLarcSection(AppStore.getAddedSectionCodes().has(larcSectionKey));
    }, [term]);

    const updateCalendarEvents = useCallback(() => {
        setCalendarEvents(AppStore.getCourseEventsInCalendar());
    }, [setCalendarEvents]);

    const [hoveredEvents, setHoveredEvents] = useHoveredStore((store) => [store.hoveredEvents, store.setHoveredEvents]);

    // const alreadyHovered = useMemo(() => {
    //     return hoveredEvents?.some((scheduleCourse) => scheduleCourse.section.sectionCode == section.sectionCode);
    // }, [hoveredEvents, section.sectionCode]);

    // const handleHover = useCallback(() => {
    //     if (!previewMode || alreadyHovered || addedLarcSection) {
    //         setHoveredEvents(undefined);
    //     } else {
    //         setHoveredEvents(section, courseDetails, term);
    //     }
    // }, [previewMode, alreadyHovered, addedLarcSection, setHoveredEvents, section, courseDetails, term]);

    // Attach event listeners to the store.
    useEffect(() => {
        AppStore.on('addedCoursesChange', updateHighlight);
        AppStore.on('currentScheduleIndexChange', updateHighlight);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateHighlight);
            AppStore.removeListener('currentScheduleIndexChange', updateHighlight);
        };
    }, [updateHighlight]);

    useEffect(() => {
        AppStore.on('addedCoursesChange', updateCalendarEvents);
        AppStore.on('currentScheduleIndexChange', updateCalendarEvents);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateCalendarEvents);
            AppStore.removeListener('currentScheduleIndexChange', updateCalendarEvents);
        };
    }, [updateCalendarEvents]);

    /**
     * Whether the current section conflicts with any of the calendar events.
     */
    // const scheduleConflict = useMemo(() => {
    //     // If there are currently no calendar events, there can't be any conflicts.
    //     if (calendarEvents.length === 0) {
    //         return false;
    //     }

    //     // If the section's time wasn't parseable, then don't consider conflicts.
    //     if (sectionDetails.startTime == null || sectionDetails.endTime == null) {
    //         return false;
    //     }

    //     const { startTime, endTime } = sectionDetails;

    //     const conflictingEvent = calendarEvents.find((event) => {
    //         // If it occurs on a different day, no conflict.
    //         if (!sectionDetails?.daysOccurring?.includes(event.start.getDay())) {
    //             return false;
    //         }

    //         /**
    //          * A time normalized to ##:##
    //          * @example '10:00'
    //          */
    //         const eventStartTime = event.start.toString().split(' ')[4].slice(0, -3);

    //         /**
    //          * Normalized to ##:##
    //          * @example '10:00'
    //          */
    //         const eventEndTime = event.end.toString().split(' ')[4].slice(0, -3);

    //         const happensBefore = startTime <= eventStartTime && endTime <= eventStartTime;

    //         const happensAfter = startTime >= eventEndTime && endTime >= eventEndTime;

    //         return !(happensBefore || happensAfter);
    //     });

    //     return Boolean(conflictingEvent);
    // }, [calendarEvents, sectionDetails]);

    const scheduleConflict = false;

    /* allowHighlight is always false on CourseRenderPane and always true on AddedCoursePane */
    const computedAddedCourseStyle = allowHighlight
        ? isDark
            ? { background: '#b0b04f' }
            : { background: '#fcfc97' }
        : {};
    const computedScheduleConflictStyle = scheduleConflict
        ? isDark
            ? { background: '#121212', opacity: '0.6' }
            : { background: '#a0a0a0', opacity: '1' }
        : {};

    const computedRowStyle = addedLarcSection ? computedAddedCourseStyle : computedScheduleConflictStyle;

    return (
        <TableRow
            classes={{ root: classes.row }}
            className={classNames(classes.tr)}
            style={computedRowStyle}
            // onMouseEnter={handleHover}
            // onMouseLeave={handleHover}
        >
            {Object.entries(tableBodyCells)
                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                .map(([column, Component]) => {
                    return (
                        <Component
                            key={column}
                            section={section}
                            courseDetails={courseDetails}
                            term={term}
                            scheduleConflict={scheduleConflict}
                            scheduleNames={scheduleNames}
                            meetings={[section.days]}
                            instructors={[section.instructor]}
                            {...section}
                            courseName={`${courseDetails.deptCode} ${courseDetails.courseNumber}`}
                            {...courseDetails}
                        />
                    );
                })}
        </TableRow>
    );
});
