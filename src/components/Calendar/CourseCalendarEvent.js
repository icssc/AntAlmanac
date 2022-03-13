import React from 'react';
import { IconButton, Paper, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import ColorPicker from '../App/ColorPicker.js';
import { Delete } from '@material-ui/icons';
import locations from '../SectionTable/static/locations.json';
import { deleteCourse, deleteCustomEvent } from '../../actions/AppStoreActions';
import CustomEventDialog from '../CustomEvents/CustomEventDialog';
import AppStore from '../../stores/AppStore';
import { clickToCopy } from '../../helpers';
import ReactGA from 'react-ga';

const styles = {
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
};

const genMapLink = (location) => {
    try {
        const location_id = locations[location.split(' ')[0]];
        return 'https://map.uci.edu/?id=463#!m/' + location_id;
    } catch (err) {
        return 'https://map.uci.edu/';
    }
};

const CourseCalendarEvent = (props) => {
    const { classes, courseInMoreInfo, currentScheduleIndex } = props;

    if (!courseInMoreInfo.isCustomEvent) {
        const { term, instructors, sectionCode, courseTitle, finalExam, bldg } = courseInMoreInfo;

        return (
            <Paper className={classes.courseContainer}>
                <div className={classes.titleBar}>
                    <span className={classes.title}>{courseTitle}</span>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={() => {
                                deleteCourse(sectionCode, currentScheduleIndex, term);
                                ReactGA.event({
                                    category: 'antalmanac-rewrite',
                                    action: 'Click Delete Course',
                                    label: 'Course Calendar Event',
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
                                <td onClick={(e) => clickToCopy(e, sectionCode)} className={classes.rightCells}>
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
                                {bldg !== 'TBA' ? (
                                    <a href={genMapLink(bldg)} target="_blank" rel="noopener noreferrer">
                                        {bldg}
                                    </a>
                                ) : (
                                    bldg
                                )}
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
                                    customEventID={courseInMoreInfo.customEventID}
                                    sectionCode={courseInMoreInfo.sectionCode}
                                    term={courseInMoreInfo.term}
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
                        />
                    </div>
                    <CustomEventDialog
                        onDialogClose={props.closePopover}
                        customEvent={AppStore.getCustomEvents().find(
                            (customEvent) => customEvent.customEventID === customEventID
                        )}
                    />

                    <Tooltip title="Delete">
                        <IconButton
                            onClick={() => {
                                props.closePopover();
                                deleteCustomEvent(customEventID, currentScheduleIndex);
                                ReactGA.event({
                                    category: 'antalmanac-rewrite',
                                    action: 'Click Delete Custom Event',
                                    label: 'Course Calendar Event',
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

CourseCalendarEvent.propTypes = {
    courseInMoreInfo: PropTypes.object.isRequired,
    closePopover: PropTypes.func.isRequired,
    currentScheduleIndex: PropTypes.number.isRequired,
};

export default withStyles(styles)(CourseCalendarEvent);
