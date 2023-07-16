import { Link } from 'react-router-dom';
import {
    Box,
    Button,
    Popover,
    TableCell,
    TableRow,
    Theme,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';
import { bindHover, bindPopover, usePopupState } from 'material-ui-popup-state/hooks';
import { Fragment, useCallback, useContext, useEffect, useState } from 'react';

import { AASection } from '@packages/antalmanac-types';
import { WebsocSectionEnrollment, WebsocSectionMeeting } from 'peterportal-api-next-types';
import { MOBILE_BREAKPOINT } from '../../../globals';
import { OpenSpotAlertPopoverProps } from './OpenSpotAlertPopover';
import { ColorAndDelete, ScheduleAddCell } from './SectionTableButtons';
import restrictionsMapping from './static/restrictionsMapping.json';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy, CourseDetails, isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';
import { mobileContext } from '$components/MobileHome';
import locationIds from '$lib/location_ids';

const styles: Styles<Theme, object> = (theme) => ({
    popover: {
        pointerEvents: 'none',
    },
    sectionCode: {
        padding: 0,
        display: 'inline-block',
        cursor: 'pointer',
        '&:hover': {
            color: isDarkMode() ? 'gold' : 'blueviolet',
            cursor: 'pointer',
        },
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    tr: {
        // styling changes (e.g. color, spacing of gradient) needs input and tweaking
        '&.timingWarning': {
            '&:nth-of-type(odd)': {
                background: `repeating-linear-gradient(
                    45deg,
                    #f44336,
                    #f44336 2px,
                    ${theme.palette.action.hover} 2px,
                    ${theme.palette.action.hover} 80px
                )`,
            },
            '&:nth-of-type(even)': {
                background: `repeating-linear-gradient(
                    45deg,
                    #f44336,
                    #f44336 2px,
                    ${theme.palette.background.paper} 2px,
                    ${theme.palette.background.paper} 80px
                )`,
            },
        },
        '&.addedCourse': {
            // I'm told !important is bad practice,
            //but something something CSS heirarchy is kicking my butt so I'll fix it later
            background: isDarkMode() ? '#b0b04f !important' : '#fcfc97 !important',
        },
    },
    cell: {
        fontSize: '0.85rem',
    },
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
    Dis: { color: '#8d63f0' },
    Fld: { color: '#1ac805' },
    Lab: { color: '#1abbe9' },
    Lec: { color: '#d40000' },
    Qiz: { color: '#8e5c41' },
    Res: { color: '#ff2466' },
    Sem: { color: '#2155ff' },
    Stu: { color: '#179523' },
    Tap: { color: '#8d2df0' },
    Tut: { color: '#ffc705' },
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
        <NoPaddingTableCell className={classes.cell}>
            <Tooltip title="Click to copy course code" placement="bottom" enterDelay={300}>
                <Button
                    size="small"
                    onClick={(event) => {
                        clickToCopy(event, sectionCode);
                        logAnalytics({
                            category: analyticsEnum.classSearch.title,
                            action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
                        });
                    }}
                    className={classes.sectionCode}
                >
                    {sectionCode}
                </Button>
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

interface LocationsCellProps {
    classes: ClassNameMap;
    meetings: WebsocSectionMeeting[];
    courseName: string; // Used in map pin popup
}

const LocationsCell = withStyles(styles)((props: LocationsCellProps) => {
    const { classes, meetings } = props;
    const { setSelectedTab } = useContext(mobileContext);

    const focusMap = useCallback(() => {
        setSelectedTab(1);
    }, [setSelectedTab]);

    return (
        <NoPaddingTableCell className={classes.cell}>
            {meetings.map((meeting) => {
                const [buildingName = ''] = meeting.bldg;
                const buildingId = locationIds[buildingName] ?? 69420;
                return meeting.bldg[0] !== 'TBA' ? (
                    <Fragment key={meeting.days + meeting.time + meeting.bldg}>
                        <Link
                            className={classes.clickableLocation}
                            to={`/map?location=${buildingId}`}
                            onClick={focusMap}
                        >
                            {meeting.bldg}
                        </Link>
                        <br />
                    </Fragment>
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
    /** This is a string because sometimes it's "n/a" */
    numOnWaitlist: string;
    /** This is a string because numOnWaitlist is a string. I haven't seen this be "n/a" but it seems possible and I don't want it to break if that happens. */
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
    const popupState = usePopupState({ popupId: 'RestrictionsCellPopup', variant: 'popover' });

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
                <Typography {...bindHover(popupState)}>
                    <a
                        href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {restrictions}
                    </a>
                </Typography>
                <Popover
                    {...bindPopover(popupState)}
                    className={classes.popover}
                    classes={{ paper: classes.paper }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    disableRestoreFocus
                >
                    <Typography>{parseRestrictions(restrictions)}</Typography>
                </Popover>
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

    return (
        <NoPaddingTableCell className={classes.cell}>
            {meetings.map((meeting) => {
                const timeString = meeting.time.replace(/\s/g, '').split('-').join(' - ');
                return <Box key={meeting.days + meeting.time + meeting.bldg}>{`${meeting.days} ${timeString}`}</Box>;
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
        <NoPaddingTableCell className={`${classes[status.toLowerCase()]} ${classes.cell}`}>{status}</NoPaddingTableCell>
    );
});

interface SectionTableBodyProps {
    classes: ClassNameMap;
    section: AASection;
    courseDetails: CourseDetails;
    term: string;
    colorAndDelete: boolean;
    highlightAdded: boolean;
    scheduleNames: string[];
}

//TODO: SectionNum name parity -> SectionNumber
const SectionTableBody = withStyles(styles)((props: SectionTableBodyProps) => {
    const { classes, section, courseDetails, term, colorAndDelete, highlightAdded, scheduleNames } = props;
    const [addedCourse, setAddedCourse] = useState(colorAndDelete);

    const [scheduleConflict, setScheduleConflict] = useState(false);

    const translateDaysToNums: { [key: string]: number } = {
        Su: 0,
        M: 1,
        Tu: 2,
        W: 3,
        Th: 4,
        F: 5,
        Sa: 6,
    };

    // the following timeString code is stolen from ${calendarizeCourseEvents}
    const translateTimeString = () => {
        const timeString = section.meetings[0].time.replace(/\s/g, '');

        if (timeString !== 'TBA' && timeString !== undefined) {
            const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = timeString?.match(
                /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
            ) as RegExpMatchArray;

            let startHr = parseInt(startHrStr, 10);
            let endHr = parseInt(endHrStr, 10);

            if (ampm === 'p' && endHr !== 12) {
                startHr += 12;
                endHr += 12;
                if (startHr > endHr) startHr -= 12;
            }

            // Times are standardized to ##:##:## for correct comparisons as strings
            return {
                startTime: `${startHr < 10 ? `0${startHr}` : startHr}:${startMinStr}:00`,
                endTime: `${endHr < 10 ? `0${endHr}` : endHr}:${endMinStr}:00`,
            };
        }

        return undefined;
    };

    useEffect(() => {
        const toggleHighlight = () => {
            const doAdd = AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`);
            setAddedCourse(doAdd);
        };

        const checkScheduleConflict = () => {
            if (AppStore.getEventsInCalendar().length < 1) {
                setScheduleConflict(false);
                return;
            }

            // An array of lists of time information on every added event
            const calendarEventTimes = AppStore.getEventsInCalendar().map((event) => {
                const courseDay = event.start.getDay();
                const courseStartTime = event.start.toString().split(' ')[4];
                const courseEndTime = event.end.toString().split(' ')[4];
                return { day: courseDay, startTime: courseStartTime, endTime: courseEndTime };
            });

            const coursePaneEvent = {
                // If there already exists a more well-written way to translate secton.meetings days (string) into a number, LMK
                // Converts SuTuTh -> [Su, Tu, Th] -> [0, 2, 4]
                day: section.meetings[0].days.match(/[A-Z][a-z]*/g)?.map((day: string) => translateDaysToNums[day]),
                startTime: '',
                endTime: '',
            };

            // Wasn't sure if running the function constantly in useEffect was bad, so moved it out just in case
            const translatedTimeString = translateTimeString();
            if (translatedTimeString) {
                coursePaneEvent.startTime = translatedTimeString.startTime;
                coursePaneEvent.endTime = translatedTimeString.endTime;
            }

            for (let i = 0; i < calendarEventTimes.length; i++) {
                // Check if there is day overlap
                if (!coursePaneEvent?.day?.includes(calendarEventTimes[i]?.day)) {
                    continue;
                }

                // Then, IF the course ( starts AND ends BEFORE) OR ( starts AND ends AFTER), it's good
                // Currently, it's coded to be greater/less than or equal to, but... if class A ends at 1:00 PM and class B starts at 1:00 PM, you're kinda boned, no?
                const happensBefore =
                    coursePaneEvent.startTime <= calendarEventTimes[i].startTime &&
                    coursePaneEvent.endTime <= calendarEventTimes[i].startTime;
                const happensAfter =
                    coursePaneEvent.startTime >= calendarEventTimes[i].endTime &&
                    coursePaneEvent.endTime >= calendarEventTimes[i].endTime;

                // Otherwise, mark it in red
                if (!(happensBefore || happensAfter)) {
                    setScheduleConflict(true);
                    return;
                }
            }
            setScheduleConflict(false);
            return;
        };

        toggleHighlight();
        AppStore.on('addedCoursesChange', toggleHighlight);
        AppStore.on('currentScheduleIndexChange', toggleHighlight);

        checkScheduleConflict();
        AppStore.on('addedCoursesChange', checkScheduleConflict);
        AppStore.on('currentScheduleIndexChange', checkScheduleConflict);

        return () => {
            AppStore.removeListener('addedCoursesChange', toggleHighlight);
            AppStore.removeListener('currentScheduleIndexChange', toggleHighlight);
            AppStore.removeListener('addedCoursesChange', checkScheduleConflict);
            AppStore.removeListener('currentScheduleIndexChange', checkScheduleConflict);
        };
    }, [section.sectionCode, term]); //should only run once on first render since these shouldn't change.

    return (
        <TableRow
            classes={{ root: classes.row }}
            className={classNames(
                classes.tr,
                { timingWarning: scheduleConflict },
                { addedCourse: addedCourse && highlightAdded }
            )}
        >
            {!addedCourse ? (
                <ScheduleAddCell
                    section={section}
                    courseDetails={courseDetails}
                    term={term}
                    scheduleNames={scheduleNames}
                />
            ) : (
                <ColorAndDelete color={section.color} sectionCode={section.sectionCode} term={term} />
            )}
            <CourseCodeCell sectionCode={section.sectionCode} />
            <SectionDetailsCell
                sectionType={section.sectionType as SectionType}
                sectionNum={section.sectionNum}
                units={parseFloat(section.units)}
            />
            <InstructorsCell instructors={section.instructors} />
            <DayAndTimeCell meetings={section.meetings} />
            <LocationsCell
                meetings={section.meetings}
                courseName={courseDetails.deptCode + ' ' + courseDetails.courseNumber}
            />
            <SectionEnrollmentCell
                numCurrentlyEnrolled={section.numCurrentlyEnrolled}
                maxCapacity={parseInt(section.maxCapacity)}
                numOnWaitlist={section.numOnWaitlist}
                numNewOnlyReserved={section.numNewOnlyReserved}
            />
            <RestrictionsCell restrictions={section.restrictions} />
            <StatusCell
                term={term}
                status={section.status}
                sectionCode={section.sectionCode}
                courseTitle={courseDetails.courseTitle}
                courseNumber={courseDetails.courseNumber}
            />
        </TableRow>
    );
});

export default withStyles(styles)(SectionTableBody);
