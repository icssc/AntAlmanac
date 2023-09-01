import { Link } from 'react-router-dom';
import { bindHover, bindPopover, usePopupState } from 'material-ui-popup-state/hooks';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { WebsocSectionEnrollment, WebsocSectionMeeting } from 'peterportal-api-next-types';
import {
    Box,
    Button,
    Chip,
    Popover,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { AASection } from '@packages/antalmanac-types';

import RightPaneStore, { type SectionTableColumn } from '../RightPaneStore';
import { MOBILE_BREAKPOINT } from '../../../globals';
import { OpenSpotAlertPopoverProps } from './OpenSpotAlertPopover';
import { ColorAndDelete, ScheduleAddCell } from './SectionTableButtons';
import restrictionsMapping from './static/restrictionsMapping.json';
import GradesPopup from './GradesPopup';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy, CourseDetails, isDarkMode, queryGrades } from '$lib/helpers';
import AppStore from '$stores/AppStore';
import { mobileContext } from '$components/MobileHome';
import locationIds from '$lib/location_ids';
import { translateWebSOCTimeTo24HourTime, parseDaysString } from '$stores/calendarizeHelpers';

type SectionType = 'Act' | 'Col' | 'Dis' | 'Fld' | 'Lab' | 'Lec' | 'Qiz' | 'Res' | 'Sem' | 'Stu' | 'Tap' | 'Tut';

const SECTION_COLORS: Record<SectionType, string> = {
    Act: '#c87137',
    Col: '#ff40b5',
    Dis: '#ff6e00',
    Fld: '#1ac805',
    Lab: '#1abbe9',
    Lec: '#d40000',
    Qiz: '#8e5c41',
    Res: '#ff2466',
    Sem: '#2155ff',
    Stu: '#179523',
    Tap: '#8d2df0',
    Tut: '#ffc705',
};

/**
 * TODO: maybe use this union type after the types have been figured out.
 */
// type CourseStatus = 'open' | 'waitl' | 'full';

const STATUS_COLORS: Record<string, string> = {
    open: '#00c853',
    waitl: '#1c44b2',
    full: '#e53935',
};

interface CourseCodeCellProps {
    sectionCode: string;
}

function CourseCodeCell(props: CourseCodeCellProps) {
    const { sectionCode } = props;

    return (
        <Tooltip title="Click to copy course code" placement="bottom" enterDelay={150}>
            <Chip
                onClick={(event) => {
                    clickToCopy(event, sectionCode);
                    logAnalytics({
                        category: analyticsEnum.classSearch.title,
                        action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
                    });
                }}
                sx={{
                    display: 'inline-flex',
                    cursor: 'pointer',
                    '&:hover': {
                        color: isDarkMode() ? 'gold' : 'blueviolet',
                        cursor: 'pointer',
                    },
                    alignSelf: 'center',
                }}
                label={sectionCode}
                size="small"
            />
        </Tooltip>
    );
}

interface SectionDetailCellProps {
    sectionType: SectionType;
    sectionNum: string;
    units: number;
}

function SectionDetailsCell(props: SectionDetailCellProps) {
    const { sectionType, sectionNum, units } = props;

    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    return (
        <Box sx={{ textAlign: isMobileScreen ? 'center' : 'left' }}>
            <Box color={SECTION_COLORS[sectionType]}>{sectionType}</Box>
            <Box>
                {!isMobileScreen && 'Sec: '}
                {sectionNum}
            </Box>
            <Box>
                {!isMobileScreen && 'Units: '}
                {units}
            </Box>
        </Box>
    );
}

interface InstructorsCellProps {
    instructors: string[];
}

function getLinks(professorNames: string[]) {
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
}

function InstructorsCell(props: InstructorsCellProps) {
    return <Box>{getLinks(props.instructors)}</Box>;
}

async function getGpaData(deptCode: string, courseNumber: string, instructors: string[]) {
    const namedInstructors = instructors.filter((instructor) => instructor !== 'STAFF');

    // Get the GPA of the first instructor of this section where data exists
    for (const instructor of namedInstructors) {
        const grades = await queryGrades(deptCode, courseNumber, instructor);
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

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(anchorEl ? null : event.currentTarget);
        },
        [setAnchorEl]
    );

    const hideDistribution = useCallback(() => {
        setAnchorEl(null);
    }, [setAnchorEl]);

    useEffect(() => {
        getGpaData(deptCode, courseNumber, instructors)
            .then((data) => {
                if (data) {
                    setGpa(data.gpa);
                    setInstructor(data.instructor);
                }
            })
            .catch(console.log);
    }, [deptCode, courseNumber, instructors, setGpa, setInstructor]);

    return (
        <Box>
            <Button
                sx={{
                    color: isDarkMode() ? 'dodgerblue' : 'blue',
                    padding: 0,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: 16,
                }}
                onClick={handleClick}
                variant="text"
            >
                {gpa}
            </Button>
            <Popover
                open={Boolean(anchorEl)}
                sx={{
                    color: isDarkMode() ? 'dodgerblue' : 'blue',
                    cursor: 'pointer',
                }}
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
        </Box>
    );
}

interface LocationsCellProps {
    meetings: WebsocSectionMeeting[];

    // Used in map pin popup
    courseName: string;
}

function LocationsCell(props: LocationsCellProps) {
    const { meetings } = props;
    const { setSelectedTab } = useContext(mobileContext);

    const focusMap = useCallback(() => {
        setSelectedTab(1);
    }, [setSelectedTab]);

    return (
        <Box>
            {meetings.map((meeting) => {
                const [buildingName = ''] = meeting.bldg;
                const buildingId = locationIds[buildingName] ?? 0;

                return meeting.bldg[0] !== 'TBA' ? (
                    <Link
                        key={meeting.days + meeting.time + meeting.bldg}
                        to={`/map?location=${buildingId}`}
                        onClick={focusMap}
                    >
                        {meeting.bldg}
                        <br />
                    </Link>
                ) : (
                    <Box>{meeting.bldg}</Box>
                );
            })}
        </Box>
    );
}

interface SectionEnrollmentCellProps {
    numCurrentlyEnrolled: WebsocSectionEnrollment;
    maxCapacity: number;

    /**
     * This is a string because sometimes it's "n/a"
     */
    numOnWaitlist: string;

    /**
     * This is a string because {@link numOnWaitlist} is a string.
     * I haven't seen this be "n/a" but it seems possible and I don't want it to break if that happens.
     */
    numNewOnlyReserved: string;
}

function SectionEnrollmentCell(props: SectionEnrollmentCellProps) {
    const { numCurrentlyEnrolled, maxCapacity, numOnWaitlist, numNewOnlyReserved } = props;

    return (
        <Box>
            <Typography fontWeight={500} variant="body2">
                {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
            </Typography>
            {numOnWaitlist && <Typography variant="body2">WL: {numOnWaitlist}</Typography>}
            {numNewOnlyReserved && <Typography variant="body2">NOR: {numNewOnlyReserved}</Typography>}
        </Box>
    );
}

interface RestrictionsCellProps {
    restrictions: string;
}

/**
 * TODO: move this to `src/lib/utils` (already done on main branch).
 */
function notNull<T>(value: T): value is NonNullable<T> {
    return value != null;
}

function parseRestrictions(restrictionCode: string): string[] {
    const parsedRestrictions = restrictionCode.split(' ').map((code) => {
        return code === 'and' || code === 'or' ? null : restrictionsMapping[code as keyof typeof restrictionsMapping];
    });
    return parsedRestrictions.filter(notNull);
}

function RestrictionsCell(props: RestrictionsCellProps) {
    const popupState = usePopupState({ popupId: 'RestrictionsCellPopup', variant: 'popover' });

    const parsedRestrictions = useMemo(() => {
        return parseRestrictions(props.restrictions);
    }, [props.restrictions]);

    return (
        <Box>
            <Typography {...bindHover(popupState)}>
                <a
                    href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {props.restrictions}
                </a>
            </Typography>
            <Popover
                {...bindPopover(popupState)}
                sx={{ pointerEvents: 'none' }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                disableRestoreFocus
            >
                <Box padding={1}>
                    {parsedRestrictions.map((restriction) => (
                        <Typography key={restriction}>
                            {restriction} <br />
                        </Typography>
                    ))}
                </Box>
            </Popover>
        </Box>
    );
}

interface DayAndTimeCellProps {
    meetings: WebsocSectionMeeting[];
}

function DayAndTimeCell(props: DayAndTimeCellProps) {
    return (
        <Box>
            {props.meetings.map((meeting) => {
                const timeString = meeting.time.replace(/\s/g, '').split('-').join(' - ');
                return (
                    <Typography key={meeting.days + meeting.time + meeting.bldg} variant="body2">
                        {`${meeting.days} ${timeString}`}
                    </Typography>
                );
            })}
        </Box>
    );
}

interface StatusCellProps extends OpenSpotAlertPopoverProps {
    term: string;
}

function StatusCell(props: StatusCellProps) {
    return <TableCell sx={{ color: STATUS_COLORS[props.status.toLowerCase()] }}>{props.status}</TableCell>;
}

interface SectionTableBodyProps {
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

const tableBodyCellEntries = Object.entries(tableBodyCells);

/**
 * TODO: SectionNum name parity -> SectionNumber
 */
function SectionTableBody(props: SectionTableBodyProps) {
    const { section, courseDetails, term, allowHighlight, scheduleNames } = props;

    const [activeColumns, setColumns] = useState<SectionTableColumn[]>(RightPaneStore.getActiveColumns());

    const [addedCourse, setAddedCourse] = useState(
        AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`)
    );

    const [calendarEvents, setCalendarEvents] = useState(AppStore.getCourseEventsInCalendar());

    const theme = useTheme();

    /**
     * Additional information about the current section being rendered.
     * i.e. time information, which is compared with the calendar events to find conflicts.
     */
    const sectionDetails = useMemo(() => {
        return {
            daysOccurring: parseDaysString(section.meetings[0].days),
            ...translateWebSOCTimeTo24HourTime(section.meetings[0].time),
        };
    }, [section.meetings[0]]);

    // Stable references to event listeners will synchronize React state with the store.

    const updateColumns = useCallback(
        (newActiveColumns: SectionTableColumn[]) => {
            setColumns(newActiveColumns);
        },
        [setColumns]
    );

    const updateHighlight = useCallback(() => {
        setAddedCourse(AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`));
    }, [setAddedCourse]);

    const updateCalendarEvents = useCallback(() => {
        setCalendarEvents(AppStore.getCourseEventsInCalendar());
    }, [setCalendarEvents]);

    // Attach event listeners to the store.

    useEffect(() => {
        RightPaneStore.on('columnChange', updateColumns);
        return () => {
            RightPaneStore.removeListener('columnChange', updateColumns);
        };
    }, [updateColumns]);

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
            sx={{
                '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.action.hover,
                },
                '& .MuiTableCell-root': {
                    padding: 0,
                },
                ...(allowHighlight && addedCourse && { background: isDarkMode() ? '#b0b04f' : '#fcfc97' }),
                ...(allowHighlight &&
                    scheduleConflict && {
                        background: isDarkMode() ? '#121212' : '#a0a0a0',
                        opacity: isDarkMode() ? 0.6 : 1,
                    }),
            }}
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

            {tableBodyCellEntries
                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                .map(([column, Component]) => {
                    return (
                        // All of this is a little bulky, so if the props can be added specifically to activeTableBodyColumns, LMK!
                        <TableCell key={column}>
                            <Component
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
                        </TableCell>
                    );
                })}
        </TableRow>
    );
}

export default SectionTableBody;
