import {
    Box,
    Button,
    Chip,
    Popover,
    TableCell,
    TableRow,
    Theme,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { AASection } from '@packages/antalmanac-types';
import { WebsocSectionEnrollment, WebsocSectionMeeting } from 'peterportal-api-next-types';

import { MOBILE_BREAKPOINT } from '../../../globals';
import { OpenSpotAlertPopoverProps } from './OpenSpotAlertPopover';
import { ColorAndDelete, ScheduleAddCell } from './SectionTableButtons';
import restrictionsMapping from './static/restrictionsMapping.json';
import GradesPopup from './GradesPopup';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy, isDarkMode } from '$lib/helpers';
import { CourseDetails } from '$lib/course_data.types';
import Grades from '$lib/grades';
import AppStore from '$stores/AppStore';
import { useTabStore } from '$stores/TabStore';
import locationIds from '$lib/location_ids';
import { normalizeTime, parseDaysString, formatTimes } from '$stores/calendarizeHelpers';
import useColumnStore, { type SectionTableColumn } from '$stores/ColumnStore';
import { useTimeFormatStore } from '$stores/TimeStore';

const styles: Styles<Theme, object> = (theme) => ({
    sectionCode: {
        display: 'inline-flex',
        cursor: 'pointer',
        '&:hover': {
            color: isDarkMode() ? 'gold' : 'blueviolet',
            cursor: 'pointer',
        },
        alignSelf: 'center',
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    tr: {
        '&.addedCourse': {
            background: isDarkMode() ? '#b0b04f' : '#fcfc97',
        },
        '&.scheduleConflict': {
            background: isDarkMode() ? '#121212' : '#a0a0a0',
            opacity: isDarkMode() ? 0.6 : 1,
        },
    },
    cell: {},
    link: {
        textDecoration: 'underline',
        color: isDarkMode() ? 'dodgerblue' : 'blue',
        cursor: 'pointer',
    },
    mapLink: {
        color: isDarkMode() ? 'dodgerblue' : 'blue',
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
        color: isDarkMode() ? 'dodgerblue' : 'blue',
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

interface CourseCodeCellProps {
    classes: ClassNameMap;
    sectionCode: string;
}

const CourseCodeCell = withStyles(styles)((props: CourseCodeCellProps) => {
    const { classes, sectionCode } = props;

    return (
        <NoPaddingTableCell className={`${classes.cell} ${classes.codeCell}`}>
            <Tooltip title="Click to copy course code" placement="bottom" enterDelay={150}>
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
            </Tooltip>
        </NoPaddingTableCell>
    );
});

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
            <Box className={classes[sectionType]}>{sectionType}</Box>
            <Box>
                {!isMobileScreen && <>Sec: </>}
                {sectionNum}
            </Box>
            <Box>
                {!isMobileScreen && <>Units: </>}
                {units}
            </Box>
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

async function getGpaData(deptCode: string, courseNumber: string, instructors: string[]) {
    const namedInstructors = instructors.filter((instructor) => instructor !== 'STAFF');

    // Get the GPA of the first instructor of this section where data exists
    for (const instructor of namedInstructors) {
        const grades = await Grades.queryGrades(
            deptCode,
            courseNumber,
            instructor,
            useTabStore.getState().activeTab != 1
        );
        if (grades?.averageGPA) {
            return {
                gpa: grades.averageGPA.toFixed(2).toString(),
                instructor: instructor,
            };
        }
    }

    return undefined;
}

interface GPACellProps {
    deptCode: string;
    courseNumber: string;
    instructors: string[];
}

function GPACell(props: GPACellProps) {
    const { deptCode, courseNumber, instructors } = props;

    const [gpa, setGpa] = useState('');

    const [instructor, setInstructor] = useState('');

    const [anchorEl, setAnchorEl] = useState<Element>();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((currentAnchorEl) => (currentAnchorEl ? undefined : event.currentTarget));
    }, []);

    const hideDistribution = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    useEffect(() => {
        getGpaData(deptCode, courseNumber, instructors)
            .then((data) => {
                if (data) {
                    setGpa(data.gpa);
                    setInstructor(data.instructor);
                }
            })
            .catch(console.log);
    }, [deptCode, courseNumber, instructors]);

    return (
        <NoPaddingTableCell>
            <Button
                style={{
                    color: isDarkMode() ? 'dodgerblue' : 'blue',
                    padding: 0,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: '1rem',
                }}
                onClick={handleClick}
                variant="text"
            >
                {gpa}
            </Button>
            <Popover
                open={Boolean(anchorEl)}
                onClose={hideDistribution}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                disableRestoreFocus
            >
                <GradesPopup
                    deptCode={deptCode}
                    courseNumber={courseNumber}
                    instructor={instructor}
                    isMobileScreen={useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`)}
                />
            </Popover>
        </NoPaddingTableCell>
    );
}

interface LocationsCellProps {
    classes: ClassNameMap;
    meetings: WebsocSectionMeeting[];
    courseName: string; // Used in map pin popup
}

const LocationsCell = withStyles(styles)((props: LocationsCellProps) => {
    const { classes, meetings } = props;

    const { setActiveTab } = useTabStore();

    const focusMap = useCallback(() => {
        setActiveTab(2);
    }, [setActiveTab]);

    return (
        <NoPaddingTableCell className={classes.cell}>
            {meetings.map((meeting) => {
                return meeting.bldg[0] !== 'TBA' ? (
                    meeting.bldg.map((bldg) => {
                        const [buildingName = ''] = bldg.split(' ');
                        const buildingId = locationIds[buildingName];
                        return (
                            <Fragment key={meeting.timeIsTBA + bldg}>
                                <Link className={classes.mapLink} to={`/map?location=${buildingId}`} onClick={focusMap}>
                                    {bldg}
                                </Link>
                                <br />
                            </Fragment>
                        );
                    })
                ) : (
                    <Box>{meeting.bldg}</Box>
                );
            })}
        </NoPaddingTableCell>
    );
});

interface SectionEnrollmentCellProps {
    classes: ClassNameMap;
    numCurrentlyEnrolled: WebsocSectionEnrollment;
    maxCapacity: number;

    /**
     * This is a string because sometimes it's "n/a"
     */
    numOnWaitlist: string;

    /**
     * This is a string because numOnWaitlist is a string. I haven't seen this be "n/a" but it seems possible and I don't want it to break if that happens.
     */
    numNewOnlyReserved: string;
}

const SectionEnrollmentCell = withStyles(styles)((props: SectionEnrollmentCellProps) => {
    const { classes, numCurrentlyEnrolled, maxCapacity, numOnWaitlist, numNewOnlyReserved } = props;

    return (
        <NoPaddingTableCell className={classes.cell}>
            <Box>
                <Box>
                    <strong>
                        {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
                    </strong>
                </Box>
                {numOnWaitlist !== '' && <Box>WL: {numOnWaitlist}</Box>}
                {numNewOnlyReserved !== '' && <Box>NOR: {numNewOnlyReserved}</Box>}
            </Box>
        </NoPaddingTableCell>
    );
});

interface RestrictionsCellProps {
    classes: ClassNameMap;
    restrictions: string;
}

const RestrictionsCell = withStyles(styles)((props: RestrictionsCellProps) => {
    const { classes, restrictions } = props;

    const parseRestrictions = (restrictionCode: string) => {
        return restrictionCode.split(' ').map((code, index) => {
            if (code !== 'and' && code !== 'or') {
                return (
                    <Fragment key={index}>
                        {restrictionsMapping[code as keyof typeof restrictionsMapping]}
                        <br />
                    </Fragment>
                );
            }
            return null;
        });
    };

    return (
        <NoPaddingTableCell className={classes.cell}>
            <Box>
                <Tooltip title={<Typography>{parseRestrictions(restrictions)}</Typography>}>
                    <Typography>
                        <a
                            href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {restrictions}
                        </a>
                    </Typography>
                </Tooltip>
            </Box>
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
            {meetings.map((meeting) => {
                if (meeting.timeIsTBA) {
                    return <Box key={meeting.timeIsTBA + meeting.bldg[0]}>TBA</Box>;
                }

                if (meeting.startTime && meeting.endTime) {
                    const timeString = formatTimes(meeting.startTime, meeting.endTime, isMilitaryTime);

                    return <Box key={meeting.timeIsTBA + meeting.bldg[0]}>{`${meeting.days} ${timeString}`}</Box>;
                }
            })}
        </NoPaddingTableCell>
    );
});

interface StatusCellProps extends OpenSpotAlertPopoverProps {
    term: string;
}

const StatusCell = withStyles(styles)((props: StatusCellProps) => {
    // const { term, sectionCode, courseTitle, courseNumber, status, classes } = props;
    const { status, classes } = props;

    // TODO: Implement course notification when PeterPortal has the functionality, according to #473
    // if (term === getDefaultTerm().shortName && (status === 'NewOnly' || status === 'FULL')) {
    //     return (
    //         <NoPaddingTableCell className={`${classes[status.toLowerCase()]} ${classes.cell}`}>
    //             <OpenSpotAlertPopover
    //                 courseTitle={courseTitle}
    //                 courseNumber={courseNumber}
    //                 status={status}
    //                 sectionCode={sectionCode}
    //             />
    //         </NoPaddingTableCell>
    //     )
    return (
        <NoPaddingTableCell className={`${classes[status.toLowerCase()]} ${classes.cell} ${classes.statusCell}`}>
            {status}
        </NoPaddingTableCell>
    );
});

interface SectionTableBodyProps {
    classes: ClassNameMap;
    section: AASection;
    courseDetails: CourseDetails;
    term: string;
    allowHighlight: boolean;
    scheduleNames: string[];
}

const tableBodyCells: Record<SectionTableColumn, React.ComponentType<any>> = {
    sectionCode: CourseCodeCell,
    sectionDetails: SectionDetailsCell,
    instructors: InstructorsCell,
    gpa: GPACell,
    dayAndTime: DayAndTimeCell,
    location: LocationsCell,
    sectionEnrollment: SectionEnrollmentCell,
    restrictions: RestrictionsCell,
    status: StatusCell,
};

/**
 * TODO: SectionNum name parity -> SectionNumber
 */
const SectionTableBody = withStyles(styles)((props: SectionTableBodyProps) => {
    const { classes, section, courseDetails, term, allowHighlight, scheduleNames } = props;

    const activeColumns = useColumnStore((store) => store.activeColumns);

    const [addedCourse, setAddedCourse] = useState(
        AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`)
    );

    const [calendarEvents, setCalendarEvents] = useState(AppStore.getCourseEventsInCalendar());

    /**
     * Additional information about the current section being rendered.
     * i.e. time information, which is compared with the calendar events to find conflicts.
     */
    const sectionDetails = useMemo(() => {
        return {
            daysOccurring: parseDaysString(section.meetings[0].days),
            ...normalizeTime(section.meetings[0]),
        };
    }, [section.meetings[0]]);

    // Stable references to event listeners will synchronize React state with the store.

    const updateHighlight = useCallback(() => {
        setAddedCourse(AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`));
    }, []);

    const updateCalendarEvents = useCallback(() => {
        setCalendarEvents(AppStore.getCourseEventsInCalendar());
    }, [setCalendarEvents]);

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
    const scheduleConflict = useMemo(() => {
        // If there are currently no calendar events, there can't be any conflicts.
        if (calendarEvents.length === 0) {
            return false;
        }

        // If the section's time wasn't parseable, then don't consider conflicts.
        if (sectionDetails.startTime == null || sectionDetails.endTime == null) {
            return false;
        }

        const { startTime, endTime } = sectionDetails;

        const conflictingEvent = calendarEvents.find((event) => {
            // If it occurs on a different day, no conflict.
            if (!sectionDetails?.daysOccurring?.includes(event.start.getDay())) {
                return false;
            }

            /**
             * A time normalized to ##:##
             * @example '10:00'
             */
            const eventStartTime = event.start.toString().split(' ')[4].slice(0, -3);

            /**
             * Normalized to ##:##
             * @example '10:00'
             */
            const eventEndTime = event.end.toString().split(' ')[4].slice(0, -3);

            const happensBefore = startTime <= eventStartTime && endTime <= eventStartTime;

            const happensAfter = startTime >= eventEndTime && endTime >= eventEndTime;

            return !(happensBefore || happensAfter);
        });

        return Boolean(conflictingEvent);
    }, [calendarEvents, sectionDetails]);

    return (
        <TableRow
            classes={{ root: classes.row }}
            className={classNames(
                classes.tr,
                // If the course is added, then don't check for/apply scheduleConflict
                // allowHighlight is ALWAYS false when in Added Course Pane and ALWAYS true when in CourseRenderPane
                addedCourse ? { addedCourse: addedCourse && allowHighlight } : { scheduleConflict: scheduleConflict }
            )}
        >
            {!addedCourse ? (
                <ScheduleAddCell
                    section={section}
                    courseDetails={courseDetails}
                    term={term}
                    scheduleNames={scheduleNames}
                    scheduleConflict={scheduleConflict}
                />
            ) : (
                <ColorAndDelete color={section.color} sectionCode={section.sectionCode} term={term} />
            )}

            {Object.entries(tableBodyCells)
                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                .map(([column, Component]) => {
                    return (
                        // All of this is a little bulky, so if the props can be added specifically to activeTableBodyColumns, LMK!
                        <Component
                            key={column}
                            section={section}
                            courseDetails={courseDetails}
                            term={term}
                            scheduleNames={scheduleNames}
                            {...section}
                            sectionType={section.sectionType as SectionType}
                            maxCapacity={parseInt(section.maxCapacity, 10)}
                            units={parseFloat(section.units)}
                            courseName={`${courseDetails.deptCode} ${courseDetails.courseNumber}`}
                            {...courseDetails}
                        />
                    );
                })}
        </TableRow>
    );
});

export default withStyles(styles)(SectionTableBody);
