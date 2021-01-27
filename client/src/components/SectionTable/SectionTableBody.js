import React, { Fragment, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import locations from './static/locations';
import restrictionsMapping from './static/restrictionsMapping';
import { IconButton, Menu, Button, ButtonGroup, MenuItem, Popover, Tooltip, Typography } from '@material-ui/core';
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
    link: {
        textDecoration: 'underline',
        color: '#0645AD',
        cursor: 'pointer',
    },
    paper: {
        padding: theme.spacing.unit,
    },
    cell: { verticalAlign: 'middle', textAlign: 'center' },
    button: { cursor: 'pointer', padding: 0 },
    table: {
        borderCollapse: 'collapse',
        boxSizing: 'border-box',
        width: '100%',
        marginTop: '0.285rem',

        '& thead': {
            position: 'sticky',

            '& th': {
                border: '1px solid rgb(222, 226, 230)',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: 'rgba(0, 0, 0, 0.54)',
                textAlign: 'left',
                verticalAlign: 'bottom',
            },
        },
    },
    tr: {
        fontSize: '0.85rem',
        '&:nth-child(odd)': {
            backgroundColor: '#f5f5f5',
        },

        '& td': {
            borderLeft: '0px solid',
            borderRight: '0px solid',
            // border: '1px solid rgb(222, 226, 230)',
            textAlign: 'left',
            verticalAlign: 'top',
        },
        '&.addedCourse': {
            backgroundColor: '#fcfc97',
        },
    },
    open: {
        color: '#00c853',
    },
    waitl: {
        color: '#1c44b2',
    },
    full: {
        color: '#e53935',
    },
    multiline: {
        whiteSpace: 'pre',
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
    lightTooltip: {
        backgroundColor: 'rgba(255,255,255)',
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: 0,
        fontSize: 11,
    },
    code: {
        cursor: 'pointer',
        '&:hover': {
            color: 'blueviolet',
        },
    },
});

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
        <td className={classes.cell}>
            <IconButton
                onClick={() => closeAndAddCourse(AppStore.getCurrentScheduleIndex())}
                className={classes.button}
            >
                <Add fontSize="large" />
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
        </td>
    );
});

const CourseCodeCell = withStyles(styles)((props) => {
    const { classes, sectionCode } = props;

    return (
        <td>
            <Tooltip
                title="Click to copy course code"
                placement="bottom"
                enterDelay={300}
                classes={{ tooltip: classes.lightTooltip }}
            >
                <div onClick={(event) => {
                    clickToCopy(event, sectionCode)
                    ReactGA.event({
                        category: 'antalmanac-rewrite',
                        action: `Click section code`,
                    });
                }}  className={classes.sectionCode}>
                    {sectionCode}
                </div>
            </Tooltip>
        </td>
    );
});

const SectionDetailsCell = withStyles(styles)((props) => {
    const { classes, sectionType, sectionNum, units } = props;

    return (
        <td className={classes.multiline + ' ' + classes[sectionType]}>
            {`${sectionType}\nSec: ${sectionNum}\nUnits: ${units}`}
        </td>
    );
});

const InstructorsCell = withStyles(styles)((props) => {
    const { classes, instructors } = props;

    const CustomTooltip = withStyles((theme) => ({
        tooltip: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
        },
    }))(Tooltip);

    const handleClick = (isRMP, profName) => {
        const lastName = profName.substring(0, profName.indexOf(','));

        if (!isRMP) {
            window.open(`https://eaterevals.eee.uci.edu/browse/instructor#${lastName}`);
            ReactGA.event({
                category: 'antalmanac-rewrite',
                action: `Click instructor name`,
                label: `EaterEvals`
            });
        } else {
            window.open(
                `https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+california+irvine&queryoption=HEADER&query=${lastName}&facetSearch=true`
            );
            ReactGA.event({
                category: 'antalmanac-rewrite',
                action: `Click instructor name`,
                label: `RateMyProfessors`
            });
        }
    };

    const DualButton = (props) => {
        return (
            <ButtonGroup size="small">
                <Button key={1} value="left" onClick={() => handleClick(false, props.profName)}>
                    EaterEvals
                </Button>
                <Button key={2} value="right" onClick={() => handleClick(true, props.profName)}>
                    RMP
                </Button>
            </ButtonGroup>
        );
    };

    const getLinks = (professorNames) => {
        return professorNames.map((profName) => {
            if (profName !== 'STAFF') {
                return (
                    <CustomTooltip
                        key={profName}
                        interactive
                        placement="left"
                        title={<DualButton profName={profName} />}
                    >
                        <div className={classes.link}>{profName}</div>
                    </CustomTooltip>
                );
            } else {
                return profName;
            }
        });
    };

    return <td>{getLinks(instructors)}</td>;
});

const LocationsCell = withStyles(styles)((props) => {
    const { classes, meetings } = props;

    return (
        <td className={classes.multiline}>
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
        </td>
    );
});

const SectionEnrollmentCell = withStyles(styles)((props) => {
    const { classes, numCurrentlyEnrolled, maxCapacity, numOnWaitlist, numNewOnlyReserved } = props;
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <td>
            <div {...bindHover(popupState)} className={classes.multiline}>
                <strong>{`${numCurrentlyEnrolled.totalEnrolled} / ${maxCapacity}\n`}</strong>
                {`WL: ${numOnWaitlist}\nNOR: ${numNewOnlyReserved}`}
            </div>
            <Popover
                {...bindPopover(popupState)}
                className={classes.popover}
                classes={{ paper: classes.paper }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                disableRestoreFocus
            >
                <Typography>
                    Enrolled/Capacity
                    <br />
                    Waitlist
                    <br />
                    New-Only Reserved
                </Typography>
            </Popover>
        </td>
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
        <td>
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
        </td>
    );
});

const DayAndTimeCell = withStyles(styles)((props) => {
    const { classes, meetings } = props;

    return (
        <td className={classes.multiline}>{meetings.map((meeting) => meeting.days + ' ' + meeting.time).join('\n')}</td>
    );
});

const StatusCell = withStyles(styles)((props) => {
    const { sectionCode, term, courseTitle, courseNumber, status, classes } = props;

    if (term === '2021 Winter' && (status === 'NewOnly' || status === 'FULL')) {
        return (
            <td className={classes[status.toLowerCase()]}>
                <OpenSpotAlertPopover
                    courseTitle={courseTitle}
                    courseNumber={courseNumber}
                    status={status}
                    sectionCode={sectionCode}
                />
            </td>
        );
    } else {
        return <td className={classes[status.toLowerCase()]}>{status}</td>;
    }
});
//TODO: SectionNum name parity -> SectionNumber
const SectionTableBody = withStyles(styles)((props) => {
    const { classes, section, courseDetails, term, colorAndDelete } = props;
    const [addedCourse, setAddedCourse] = useState(false);

    const toggleHighlight = () => {
        if (AppStore.getAddedSectionCodes()[AppStore.getCurrentScheduleIndex()].has(section.sectionCode))
            setAddedCourse(true);
        else setAddedCourse(false);
    };

    useEffect(() => {
        toggleHighlight();
        AppStore.on('addedCoursesChange', toggleHighlight);
        AppStore.on('currentScheduleIndexChange', toggleHighlight);

        return () => {
            AppStore.removeListener('addedCoursesChange', toggleHighlight);
            AppStore.removeListener('currentScheduleIndexChange', toggleHighlight);
        };
    }, []);

    return (
        <tr className={classNames(classes.tr, { addedCourse: addedCourse && !colorAndDelete })}>
            {!colorAndDelete ? (
                <ScheduleAddCell section={section} courseDetails={courseDetails} term={term} />
            ) : (
                <ColorAndDelete color={section.color} sectionCode={section.sectionCode} />
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
        </tr>
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
