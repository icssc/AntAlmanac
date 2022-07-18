import React, { Fragment, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import locations from './static/locations';
import restrictionsMapping from './static/restrictionsMapping';
import { TableRow, Popover, Tooltip, Typography, TableCell, useMediaQuery } from '@material-ui/core';
import { bindHover, bindPopover, usePopupState } from 'material-ui-popup-state/hooks';
import { withStyles } from '@material-ui/core/styles';
import OpenSpotAlertPopover from './OpenSpotAlertPopover';
import PropTypes from 'prop-types';
import AppStore from '../../../stores/AppStore';
import { ColorAndDelete, ScheduleAddCell } from './SectionTableButtons';
import classNames from 'classnames';
import { clickToCopy, isDarkMode } from '../../../helpers';
import analyticsEnum, { logAnalytics } from '../../../analytics';
import { getDefaultTerm } from '../../../termData';

const styles = (theme) => ({
    popover: {
        pointerEvents: 'none',
    },
    sectionCode: {
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

const CourseCodeCell = withStyles(styles)((props) => {
    const { classes, sectionCode } = props;

    return (
        <NoPaddingTableCell className={classes.cell}>
            <Tooltip title="Click to copy course code" placement="bottom" enterDelay={300}>
                <div
                    onClick={(event) => {
                        clickToCopy(event, sectionCode);
                        ReactGA.event({
                            category: 'antalmanac-rewrite',
                            action: `Click section code`,
                        });
                        logAnalytics({
                            category: analyticsEnum.classSearch.title,
                            action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
                        });
                    }}
                    className={classes.sectionCode}
                >
                    {sectionCode}
                </div>
            </Tooltip>
        </NoPaddingTableCell>
    );
});

const SectionDetailsCell = withStyles(styles)((props) => {
    const { classes, sectionType, sectionNum, units } = props;
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

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

const InstructorsCell = withStyles(styles)((props) => {
    const { classes, instructors } = props;

    const getLinks = (professorNames) => {
        return professorNames.map((profName) => {
            if (profName !== 'STAFF') {
                const lastName = profName.substring(0, profName.indexOf(','));
                return (
                    <div key={profName}>
                        <a
                            href={`https://www.ratemyprofessors.com/search/teachers?sid=U2Nob29sLTEwNzQ=&query=${lastName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                ReactGA.event({
                                    category: 'antalmanac-rewrite',
                                    action: `Click instructor name`,
                                    label: `RateMyProfessors`,
                                });
                            }}
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

const LocationsCell = withStyles(styles)((props) => {
    const { classes, meetings } = props;

    return (
        <NoPaddingTableCell className={classes.cell}>
            {meetings.map((meeting) => {
                return meeting.bldg !== 'TBA' ? (
                    <Fragment key={meeting.days + meeting.time + meeting.bldg}>
                        <a
                            href={(() => {
                                const location_id = locations[meeting.bldg.split(' ')[0]];
                                if (location_id !== undefined) return 'https://map.uci.edu/?id=463#!m/' + location_id;
                                else return 'https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034';
                            })()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {meeting.bldg}
                        </a>
                        <br />
                    </Fragment>
                ) : (
                    <div>{meeting.bldg}</div>
                );
            })}
        </NoPaddingTableCell>
    );
});

const SectionEnrollmentCell = withStyles(styles)((props) => {
    const { classes, numCurrentlyEnrolled, maxCapacity, numOnWaitlist, numNewOnlyReserved } = props;

    return (
        <NoPaddingTableCell className={classes.cell}>
            <div>
                <div>
                    <strong>
                        {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
                    </strong>
                </div>
                {numOnWaitlist && <div>WL: {numOnWaitlist}</div>}
                {numNewOnlyReserved && <div>NOR: {numNewOnlyReserved}</div>}
            </div>
        </NoPaddingTableCell>
    );
});

const RestrictionsCell = withStyles(styles)((props) => {
    const parseRestrictions = (restrictionCode) => {
        return restrictionCode.split(' ').map((code, index) => {
            if (code !== 'and' && code !== 'or') {
                return (
                    <Fragment key={index}>
                        {restrictionsMapping[code]}
                        <br />
                    </Fragment>
                );
            }
            return null;
        });
    };

    const { classes, restrictions } = props;
    const popupState = usePopupState({ variant: 'popover' });

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

const DayAndTimeCell = withStyles(styles)((props) => {
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

const StatusCell = withStyles(styles)((props) => {
    const { sectionCode, term, courseTitle, courseNumber, status, classes } = props;

    if (term === getDefaultTerm().shortName && (status === 'NewOnly' || status === 'FULL')) {
        return (
            <NoPaddingTableCell className={`${classes[status.toLowerCase()]} ${classes.cell}`}>
                <OpenSpotAlertPopover
                    courseTitle={courseTitle}
                    courseNumber={courseNumber}
                    status={status}
                    sectionCode={sectionCode}
                />
            </NoPaddingTableCell>
        );
    } else {
        return (
            <NoPaddingTableCell className={`${classes[status.toLowerCase()]} ${classes.cell}`}>
                {status}
            </NoPaddingTableCell>
        );
    }
});
//TODO: SectionNum name parity -> SectionNumber
const SectionTableBody = withStyles(styles)((props) => {
    const { classes, section, courseDetails, term, colorAndDelete, highlightAdded, scheduleNames } = props;
    const [addedCourse, setAddedCourse] = useState(colorAndDelete);
    useEffect(() => {
        const toggleHighlight = () => {
            const doAdd = AppStore.getAddedSectionCodes()[AppStore.getCurrentScheduleIndex()].has(
                `${section.sectionCode} ${term}`
            );
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
                sectionType={section.sectionType}
                sectionNum={section.sectionNum}
                units={section.units}
            />
            <InstructorsCell instructors={section.instructors} />
            <DayAndTimeCell meetings={section.meetings} />
            <LocationsCell meetings={section.meetings} />
            <SectionEnrollmentCell
                numCurrentlyEnrolled={section.numCurrentlyEnrolled}
                maxCapacity={section.maxCapacity}
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

SectionTableBody.propTypes = {
    classes: PropTypes.object.isRequired,
    section: PropTypes.object.isRequired,
    courseDetails: PropTypes.object.isRequired,
    term: PropTypes.string.isRequired,
    colorAndDelete: PropTypes.bool.isRequired,
};

export default withStyles(styles)(SectionTableBody);
