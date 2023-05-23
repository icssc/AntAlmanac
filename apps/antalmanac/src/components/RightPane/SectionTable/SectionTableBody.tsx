import { Link } from 'react-router-dom'
import { Button, Popover, TableCell, TableRow, Theme, Tooltip, Typography, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';
import { bindHover, bindPopover, usePopupState } from 'material-ui-popup-state/hooks';
import { Fragment, useEffect, useState } from 'react';

import { MOBILE_BREAKPOINT } from '../../../globals';
import { OpenSpotAlertPopoverProps } from './OpenSpotAlertPopover';
import { ColorAndDelete, ScheduleAddCell } from './SectionTableButtons';
import restrictionsMapping from './static/restrictionsMapping.json';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy, CourseDetails, FAKE_LOCATIONS, isDarkMode } from '$lib/helpers';
import { AASection, EnrollmentCount, Meeting } from '$lib/peterportal.types';
import AppStore from '$stores/AppStore';
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
        '&.addedCourse': {
            backgroundColor: isDarkMode() ? '#b0b04f' : '#fcfc97',
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
    clickableLocation: {
        cursor: 'pointer',
        color: isDarkMode() ? '#1cbeff' : 'blue',
        background: 'none !important',
        border: 'none',
        padding: '0 !important',
        fontSize: 'inherit',
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
            <div className={classes[sectionType]}>{sectionType}</div>
            <div>
                {!isMobileScreen && <>Sec: </>}
                {sectionNum}
            </div>
            <div>
                {!isMobileScreen && <>Units: </>}
                {units}
            </div>
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
        return professorNames.map((profName) => {
            if (profName !== 'STAFF') {
                const lastName = profName.substring(0, profName.indexOf(','));
                return (
                    <div key={profName}>
                        <a
                            href={`https://www.ratemyprofessors.com/search/teachers?sid=U2Nob29sLTEwNzQ=&query=${lastName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {profName}
                        </a>
                    </div>
                );
            } else {
                return profName;
            }
        });
    };

    return <NoPaddingTableCell className={classes.cell}>{getLinks(instructors)}</NoPaddingTableCell>;
});

interface LocationsCellProps {
    classes: ClassNameMap;
    meetings: Meeting[];
}

const LocationsCell = withStyles(styles)((props: LocationsCellProps) => {
    const { classes, meetings } = props;

    return (
        <NoPaddingTableCell className={classes.cell}>
            {meetings.map((meeting) => !FAKE_LOCATIONS.includes(meeting.bldg) ? (
                <Fragment key={meeting.days + meeting.time + meeting.bldg}>
                    <Link className={classes.clickableLocation} to={`/map?location=${locationIds[meeting.bldg.split(' ')[0]]}`}>
                        {meeting.bldg}
                    </Link>
                    <br />
                </Fragment>
            ) : (
                <div>{meeting.bldg}</div>
            ))}
        </NoPaddingTableCell>
    );
});

interface SectionEnrollmentCellProps {
    classes: ClassNameMap;
    numCurrentlyEnrolled: EnrollmentCount;
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
            <div>
                <div>
                    <strong>
                        {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
                    </strong>
                </div>
                {numOnWaitlist !== '' && <div>WL: {numOnWaitlist}</div>}
                {numNewOnlyReserved !== '' && <div>NOR: {numNewOnlyReserved}</div>}
            </div>
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
            <div>
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
            </div>
        </NoPaddingTableCell>
    );
});

interface DayAndTimeCellProps {
    classes: ClassNameMap;
    meetings: Meeting[];
}

const DayAndTimeCell = withStyles(styles)((props: DayAndTimeCellProps) => {
    const { classes, meetings } = props;

    return (
        <NoPaddingTableCell className={classes.cell}>
            {meetings.map((meeting) => {
                const timeString = meeting.time.replace(/\s/g, '').split('-').join(' - ');
                return <div key={meeting.days + meeting.time + meeting.bldg}>{`${meeting.days} ${timeString}`}</div>;
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

    useEffect(() => {
        const toggleHighlight = () => {
            const doAdd = AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`);
            setAddedCourse(doAdd);
        };

        toggleHighlight();
        AppStore.on('addedCoursesChange', toggleHighlight);
        AppStore.on('currentScheduleIndexChange', toggleHighlight);

        return () => {
            AppStore.removeListener('addedCoursesChange', toggleHighlight);
            AppStore.removeListener('currentScheduleIndexChange', toggleHighlight);
        };
    }, [section.sectionCode, term]); //should only run once on first render since these shouldn't change.

    return (
        <TableRow
            classes={{ root: classes.row }}
            className={classNames(classes.tr, { addedCourse: addedCourse && highlightAdded })}
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
                units={parseInt(section.units)}
            />
            <InstructorsCell instructors={section.instructors} />
            <DayAndTimeCell meetings={section.meetings} />
            <LocationsCell
                meetings={section.meetings}
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
