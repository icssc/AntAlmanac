import React, { Fragment, useState, useEffect } from 'react';
import locations from './static/locations';
import restrictionsMapping from './static/restrictionsMapping';
import RMPData from './static/RMP';
import {
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    Popover,
} from '@material-ui/core';
import {
    usePopupState,
    bindHover,
    bindTrigger,
    bindPopover,
    bindMenu,
} from 'material-ui-popup-state/hooks';
import { withStyles } from '@material-ui/core/styles';
import { Add, ArrowDropDown } from '@material-ui/icons';
import OpenSpotAlertPopover from './OpenSpotAlertPopover';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { addCourse, openSnackbar } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';

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
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);

    useEffect(() => {
        const updateCurrentScheduleIndex = () => {
            setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
        };

        AppStore.on('currentScheduleIndexChange', updateCurrentScheduleIndex);

        return () => {
            AppStore.removeListener(
                'currentScheduleIndexChange',
                updateCurrentScheduleIndex
            );
        };
    });

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
                onClick={() => closeAndAddCourse(currentScheduleIndex)}
                className={classes.button}
            >
                <Add fontSize="large" />
            </IconButton>
            <IconButton {...bindTrigger(popupState)} className={classes.button}>
                <ArrowDropDown />
            </IconButton>
            <Menu
                {...bindMenu(popupState)}
                onClose={() => closeAndAddCourse(-1)}
            >
                <MenuItem onClick={() => closeAndAddCourse(0)}>
                    Add to schedule 1
                </MenuItem>
                <MenuItem onClick={() => closeAndAddCourse(1)}>
                    Add to schedule 2
                </MenuItem>
                <MenuItem onClick={() => closeAndAddCourse(2)}>
                    Add to schedule 3
                </MenuItem>
                <MenuItem onClick={() => closeAndAddCourse(3)}>
                    Add to schedule 4
                </MenuItem>
                <MenuItem onClick={() => closeAndAddCourse(4)}>
                    Add to all
                </MenuItem>
            </Menu>
        </td>
    );
});

const CourseCodeCell = withStyles(styles)((props) => {
    const clickToCopy = (event, sectionCode) => {
        event.stopPropagation();

        let tempEventTarget = document.createElement('input');
        document.body.appendChild(tempEventTarget);
        tempEventTarget.setAttribute('value', sectionCode);
        tempEventTarget.select();
        document.execCommand('copy');
        document.body.removeChild(tempEventTarget);
        openSnackbar('success', 'Section code copied to clipboard');
    };

    const { classes, sectionCode } = props;

    return (
        <td>
            <Tooltip
                title="Click to copy course code"
                placement="bottom"
                enterDelay={300}
                classes={{ tooltip: classes.lightTooltip }}
            >
                <div
                    onClick={(event) => clickToCopy(event, sectionCode)}
                    className={classes.sectionCode}
                >
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
            {`${sectionType}` +
                '\n' +
                `Sec: ${sectionNum}` +
                '\n' +
                `Units: ${units}`}
        </td>
    );
});

const InstructorsCell = withStyles(styles)((props) => {
    const { classes, instructors } = props;
    const popupState = usePopupState({ variant: 'popover' });

    const openRMPorEaterEval = (name) => {
        // const lastName = name.substring(0, name.indexOf(','));
        // if (props.linkToRMPSetting === false) {
        //     window.open(
        //         'https://eaterevals.eee.uci.edu/browse/instructor#' + lastName,
        //     );
        //     ReactGA.event({
        //         category: 'ProffRating_OPTION',
        //         action: 'redirect_eatereval',
        //         label: lastName,
        //     });
        // } else {
        //     const professorName = RMPData[name];
        //
        //     ReactGA.event({
        //         category: 'ProffRating_OPTION',
        //         action: 'redirect_rmp',
        //         label: lastName,
        //     });
        //
        //     if (professorName !== undefined)
        //         window.open('https://www.ratemyprofessors.com' + professorName);
        //     else
        //         window.open(
        //             `https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+california+irvine&queryoption=HEADER&query=${lastName}&facetSearch=true`,
        //         );
        // }
    };

    const getLinks = (professorNames) => {
        console.log('professors')
        console.log(professorNames)
        return professorNames.map((profName) => {
            if (profName !== 'STAFF') {
                return (
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes.link}
                        // href={openRMPorEaterEval(profName)}
                    >
                        {profName}
                    </a>
                );
            } else {
                return profName;
            }
        });
    };

    return (
        <td>
            <Typography {...bindHover(popupState)} className={classes.link}>
                {getLinks(instructors)}
            </Typography>
            <Popover
                {...bindPopover(popupState)}
                className={classes.popover}
                classes={{
                    paper: classes.paper,
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                disableRestoreFocus
            ></Popover>
        </td>
    );
});

const LocationsCell = withStyles(styles)((props) => {
    const { classes, meetings } = props;

    return (
        <td className={classes.multiline}>
            {meetings.map((meeting) => {
                return meeting.bldg !== 'TBA' ? (
                    <Fragment>
                        <a
                            href={(() => {
                                const location_id =
                                    locations[meeting.bldg.split(' ')[0]];
                                if (location_id !== undefined)
                                    return (
                                        'https://map.uci.edu/?id=463#!m/' +
                                        location_id
                                    );
                                else
                                    return 'https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034';
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
    const {
        classes,
        numCurrentlyEnrolled,
        maxCapacity,
        numOnWaitlist,
        numNewOnlyReserved,
    } = props;
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <td>
            <div {...bindHover(popupState)} className={classes.multiline}>
                <strong>
                    {`${numCurrentlyEnrolled.totalEnrolled}` +
                        ' / ' +
                        `${maxCapacity}` +
                        '\n'}
                </strong>
                {`WL: ${numOnWaitlist}` + '\n' + `NOR: ${numNewOnlyReserved}`}
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
        <td className={classes.multiline}>
            {meetings
                .map((meeting) => meeting.days + ' ' + meeting.time)
                .join('\n')}
        </td>
    );
});

const StatusCell = withStyles(styles)((props) => {
    const {
        sectionCode,
        term,
        courseTitle,
        courseNumber,
        status,
        classes,
    } = props;

    if (term === '2019 Fall' && (status === 'NewOnly' || status === 'FULL')) {
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
    const { classes, section, courseDetails, term } = props;

    return (
        <tr className={classes.tr}>
            <ScheduleAddCell
                section={section}
                courseDetails={courseDetails}
                term={term}
            />
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
};

export default withStyles(styles)(SectionTableBody);
