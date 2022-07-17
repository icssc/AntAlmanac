import React from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    useMediaQuery,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
// import AlmanacGraph from '../EnrollmentGraph/EnrollmentGraph'; uncomment when we get past enrollment data back
import CourseInfoBar from './CourseInfoBar';
import SectionTableBody from './SectionTableBody';
import CourseInfoButton from './CourseInfoButton';
import { Help, Assessment, Assignment } from '@material-ui/icons';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import PropTypes from 'prop-types';
import analyticsEnum from '../../../analytics';
import GradesPopup from './GradesPopup';

const styles = {
    flex: {
        display: 'flex',
        alignItems: 'center',
    },
    iconMargin: {
        marginRight: '4px',
    },
    cellPadding: {
        padding: '0px 0px 0px 0px',
    },
    row: {
        '&:nth-child(1)': {
            width: '8%',
        },
        '&:nth-child(2)': {
            width: '8%',
        },
        '&:nth-child(3)': {
            width: '8%',
        },
        '&:nth-child(4)': {
            width: '15%',
        },
        '&:nth-child(5)': {
            width: '12%',
        },
        '&:nth-child(6)': {
            width: '10%',
        },
        '&:nth-child(7)': {
            width: '10%',
        },
        '&:nth-child(8)': {
            width: '8%',
        },
        '&:nth-child(9)': {
            width: '8%',
        },
    },
};

const SectionTable = (props) => {
    const { classes, courseDetails, term, colorAndDelete, highlightAdded, scheduleNames, analyticsCategory } = props;
    const encodedDept = encodeURIComponent(courseDetails.deptCode);
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    return (
        <>
            <div
                style={{
                    display: 'inline-flex',
                    gap: '4px',
                    marginTop: '4px',
                }}
            >
                <CourseInfoBar
                    deptCode={courseDetails.deptCode}
                    courseTitle={courseDetails.courseTitle}
                    courseNumber={courseDetails.courseNumber}
                    analyticsCategory={analyticsCategory}
                />

                {/* Temporarily remove "Past Enrollment" until data on PeterPortal API */}
                {/* <AlmanacGraph courseDetails={courseDetails} />  */}

                {courseDetails.prerequisiteLink && (
                    <CourseInfoButton
                        analyticsCategory={analyticsCategory}
                        analyticsAction={analyticsEnum.classSearch.actions.CLICK_PREREQUISITES}
                        text={isMobileScreen ? 'Prereqs' : 'Prerequisites'}
                        icon={<Assignment />}
                        redirectLink={courseDetails.prerequisiteLink}
                    />
                )}
                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_GRADES}
                    text="Grades"
                    icon={<Assessment />}
                    popupContent={
                        <GradesPopup
                            deptCode={courseDetails.deptCode}
                            courseNumber={courseDetails.courseNumber}
                            isMobileScreen={isMobileScreen}
                        />
                    }
                />

                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_PAST_ENROLLMENT}
                    text="Past Enrollment"
                    icon={<ShowChartIcon />}
                    redirectLink={`https://zot-tracker.herokuapp.com/?dept=${encodedDept}&number=${courseDetails.courseNumber}&courseType=all`}
                />
            </div>

            <TableContainer component={Paper} style={{ margin: '8px 0px 8px 0px' }} elevation={0} variant="outlined">
                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row} />
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row}>
                                Code
                            </TableCell>
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row}>
                                Type
                            </TableCell>
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row}>
                                Instructors
                            </TableCell>
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row}>
                                Times
                            </TableCell>
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row}>
                                Places
                            </TableCell>
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row}>
                                <div className={classes.flex}>
                                    <span className={classes.iconMargin}>Enrollment</span>
                                    {!isMobileScreen && (
                                        <Tooltip
                                            title={
                                                <Typography>
                                                    Enrolled/Capacity
                                                    <br />
                                                    Waitlist
                                                    <br />
                                                    New-Only Reserved
                                                </Typography>
                                            }
                                        >
                                            <Help fontSize="small" />
                                        </Tooltip>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row}>
                                Rstr
                            </TableCell>
                            <TableCell classes={{ sizeSmall: classes.cellPadding }} className={classes.row}>
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courseDetails.sections.map((section) => {
                            return (
                                <SectionTableBody
                                    key={section.sectionCode}
                                    section={section}
                                    courseDetails={courseDetails}
                                    term={term}
                                    colorAndDelete={colorAndDelete}
                                    highlightAdded={highlightAdded}
                                    scheduleNames={scheduleNames}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

SectionTable.propTypes = {
    courseDetails: PropTypes.object.isRequired,
    term: PropTypes.string.isRequired,
    colorAndDelete: PropTypes.bool.isRequired,
};

export default withStyles(styles)(SectionTable);
