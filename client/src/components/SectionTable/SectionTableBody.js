import React, { Fragment, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import locations from './static/locations';
import restrictionsMapping from './static/restrictionsMapping';
import { TableRow, IconButton, Menu, MenuItem, Popover, Tooltip, Typography, TableCell } from '@material-ui/core';
import { bindHover, bindMenu, bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { withStyles } from '@material-ui/core/styles';
import { Add, ArrowDropDown } from '@material-ui/icons';
import OpenSpotAlertPopover from './OpenSpotAlertPopover';
import PropTypes from 'prop-types';
import { addCourse, openSnackbar } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';
import ColorAndDelete from '../AddedCourses/ColorAndDelete';
import classNames from 'classnames';
import { clickToCopy } from '../../helpers';

const styles = (theme) => ({
    popover: {
        pointerEvents: 'none',
    },
    sectionCode: {
        display: 'inline-block',
        cursor: 'pointer',
        '&:hover': {
            color: 'blueviolet',
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
            backgroundColor: AppStore.getDarkMode() ? '#b0b04f' : '#fcfc97',
        },
    },
    cell: {
        fontSize: '0.85rem',
    },
    link: {
        textDecoration: 'underline',
        color: AppStore.getDarkMode() ? 'dodgerblue' : 'blue',
        cursor: 'pointer',
    },
    paper: {
        padding: theme.spacing.unit,
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

const ScheduleAddCell = withStyles(styles)((props) => {
    const { classes, section, courseDetails, term } = props;
    const popupState = usePopupState({ variant: 'popover' });

    const closeAndAddCourse = (scheduleIndex) => {
        popupState.close();
        for (const meeting of section.meetings) {
            if (meeting.time === 'TBA') {
                openSnackbar('success', 'Online/TBA class added');
                // See Added Classes."
                break;
            }
        }

        if (scheduleIndex !== -1) {
            addCourse(section, courseDetails, term, scheduleIndex);
        }
    };

    return (
        <NoPaddingTableCell className={classes.cell}>
            <div>
                <IconButton
                    onClick={() => closeAndAddCourse(AppStore.getCurrentScheduleIndex())}
                    className={classes.button}
                >
                    <Add />
                </IconButton>
                <IconButton {...bindTrigger(popupState)} className={classes.button}>
                    <ArrowDropDown />
                </IconButton>
                <Menu {...bindMenu(popupState)} onClose={() => closeAndAddCourse(-1)}>
                    <MenuItem onClick={() => closeAndAddCourse(0)}>Add to schedule 1</MenuItem>
                    <MenuItem onClick={() => closeAndAddCourse(1)}>Add to schedule 2</MenuItem>
                    <MenuItem onClick={() => closeAndAddCourse(2)}>Add to schedule 3</MenuItem>
                    <MenuItem onClick={() => closeAndAddCourse(3)}>Add to schedule 4</MenuItem>
                    <MenuItem onClick={() => closeAndAddCourse(4)}>Add to all</MenuItem>
                </Menu>
            </div>
        </NoPaddingTableCell>
    );
});

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

    return (
        <NoPaddingTableCell className={classes.cell}>
            <div className={classes[sectionType]}>{sectionType}</div>
            <div>Sec: {sectionNum}</div>
            <div>Units: {units}</div>
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
                    <div>
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
                    <Fragment key={meeting.bldg}>
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
                <div>WL: {numOnWaitlist}</div>
                <div>NOR: {numNewOnlyReserved}</div>
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
            {meetings.map((meeting) => (
                <div>{`${meeting.days} ${meeting.time}`}</div>
            ))}
        </NoPaddingTableCell>
    );
});

const StatusCell = withStyles(styles)((props) => {
    const { sectionCode, term, courseTitle, courseNumber, status, classes } = props;

    if (term === '2022 Winter' && (status === 'NewOnly' || status === 'FULL')) {
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
    const { classes, section, courseDetails, term, colorAndDelete } = props;
    const [addedCourse, setAddedCourse] = useState(false);

    useEffect(() => {
        const toggleHighlight = () => {
            if (
                AppStore.getAddedSectionCodes()[AppStore.getCurrentScheduleIndex()].has(
                    `${section.sectionCode} ${term}`
                )
            )
                setAddedCourse(true);
            else setAddedCourse(false);
        };

        toggleHighlight();
        AppStore.on('addedCoursesChange', toggleHighlight);
        AppStore.on('currentScheduleIndexChange', toggleHighlight);

        return () => {
            AppStore.removeListener('addedCoursesChange', toggleHighlight);
            AppStore.removeListener('currentScheduleIndexChange', toggleHighlight);
        };
    }, []);

    return (
        <TableRow
            classes={{ root: classes.row }}
            className={classNames(classes.tr, { addedCourse: addedCourse && !colorAndDelete })}
        >
            {!colorAndDelete ? (
                <ScheduleAddCell section={section} courseDetails={courseDetails} term={term} />
            ) : (
                <ColorAndDelete color={section.color} sectionCode={section.sectionCode} term={courseDetails.term} />
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
