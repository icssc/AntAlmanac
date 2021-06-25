import React, { Fragment, PureComponent } from 'react';
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
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AlmanacGraph from '../EnrollmentGraph/EnrollmentGraph';
import CourseInfoBar from './CourseInfoBar';
import SectionTableBody from './SectionTableBody';
import { Help } from '@material-ui/icons';
import PropTypes from 'prop-types';

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

class SectionTable extends PureComponent {
    render() {
        const { classes, courseDetails } = this.props;
        const urlEncode = encodeURIComponent(courseDetails.deptCode);

        return (
            <Fragment>
                <div
                    style={{
                        display: 'inline-flex',
                        marginTop: '4px',
                    }}
                >
                    <CourseInfoBar
                        deptCode={courseDetails.deptCode}
                        courseTitle={courseDetails.courseTitle}
                        courseNumber={courseDetails.courseNumber}
                    />

                    <AlmanacGraph courseDetails={courseDetails} />

                    {courseDetails.prerequisiteLink ? (
                        <Typography variant="h6" style={{ flexGrow: '2', marginTop: 9 }}>
                            <a
                                target="blank"
                                style={{
                                    textDecoration: 'none',
                                    color: '#72a9ed',
                                }}
                                href={courseDetails.prerequisiteLink}
                                rel="noopener noreferrer"
                            >
                                Prerequisites
                            </a>
                        </Typography>
                    ) : (
                        <Fragment />
                    )}
                    <Typography variant="h6" style={{ flexGrow: '2', margin: 9 }}>
                        <a
                            target="blank"
                            style={{
                                marginTop: '0px',
                                fontSize: '15px',
                                textDecoration: 'none',
                                color: '#72a9ed',
                            }}
                            href={
                                'https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=' +
                                urlEncode +
                                '&classNum=' +
                                courseDetails.courseNumber +
                                '&code=&submit=Submit'
                            }
                        >
                            Zotistics
                        </a>
                    </Typography>
                </div>

                <TableContainer
                    component={Paper}
                    style={{ margin: '8px 0px 8px 0px' }}
                    elevation={0}
                    variant="outlined"
                >
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
                            {this.props.courseDetails.sections.map((section) => {
                                return (
                                    <SectionTableBody
                                        key={section.sectionCode}
                                        section={section}
                                        courseDetails={this.props.courseDetails}
                                        term={this.props.term}
                                        colorAndDelete={this.props.colorAndDelete}
                                    />
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Fragment>
        );
    }
}

SectionTable.propTypes = {
    courseDetails: PropTypes.object.isRequired,
    term: PropTypes.string.isRequired,
    colorAndDelete: PropTypes.bool.isRequired,
};

export default withStyles(styles)(SectionTable);
