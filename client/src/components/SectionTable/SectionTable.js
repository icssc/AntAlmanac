import React, { Component, Fragment, PureComponent } from 'react';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AlmanacGraphWrapped from '../AlmanacGraph/AlmanacGraph';
import CourseInfoBar from './CourseInfoBar';
import SectionTableBody from './SectionTableBody';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

const styles = {
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
            border: '1px solid rgb(222, 226, 230)',
            textAlign: 'left',
            verticalAlign: 'top',
        },
    },
};

class SectionTable extends PureComponent {
    //TODO: for efficiency, search multiple classes at once

    // state = { courseDetails: this.props.courseDetails };

    // componentDidMount = async () => {
    //     //let {building,courseCode,courseNum,coursesFull,dept,endTime,ge,instructor,label,startTime,term,units}=this.props.formData;
    //     let { dept, ge } = this.props;
    //
    //     if (ge !== 'ANY' && dept === '') {
    //         //please put all the form's props condition in to prevent search bugs
    //         const { term } = this.props;
    //
    //         const params = {
    //             department: this.state.courseDetails.deptCode,
    //             term: term,
    //             courseNumber: this.state.courseDetails.courseNumber,
    //             courseTitle: this.state.courseDetails.courseTitle,
    //         };
    //
    //         const response = await fetch('/api/websocapi', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(params),
    //         });
    //
    //         const jsonResp = await response.json();
    //
    //         const courseDetails = jsonResp.schools[0].departments[0].courses[0];
    //
    //         this.setState({
    //             courseDetails,
    //         });
    //     }
    // };

    render() {
        const { classes, term } = this.props;

        return (
            <Fragment>
                <div
                    style={{
                        display: 'inline-flex',
                    }}
                >
                    <CourseInfoBar
                        deptCode={this.props.courseDetails.deptCode}
                        courseTitle={this.props.courseDetails.courseTitle}
                        courseNumber={this.props.courseDetails.courseNumber}
                    />

                    {/*<AlmanacGraphWrapped*/}
                    {/*  term={term}*/}
                    {/*  courseDetails={courseDetails}*/}
                    {/*/>*/}

                    {this.props.courseDetails.prerequisiteLink ? (
                        <Typography
                            variant="h6"
                            style={{ flexGrow: '2', marginTop: 9 }}
                        >
                            <a
                                target="blank"
                                style={{
                                    textDecoration: 'none',
                                    color: '#72a9ed',
                                }}
                                href={this.props.courseDetails.prerequisiteLink}
                                rel="noopener noreferrer"
                            >
                                Prerequisites
                            </a>
                        </Typography>
                    ) : (
                        <Fragment />
                    )}
                </div>
                <table className={classes.table}>
                    <thead>
                        <tr>
                            <th>Add</th>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Instructors</th>
                            <th>Times</th>
                            <th>Places</th>
                            <th>Enrollment</th>
                            <th>Rstr</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.courseDetails.sections.map((section) => {
                            return (
                                <SectionTableBody
                                    section={section}
                                    courseDetails={this.props.courseDetails}
                                    term={term}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </Fragment>
        );
    }
}

SectionTable.propTypes = {
    classes: PropTypes.object.isRequired,
    courseDetails: PropTypes.object.isRequired,
    dept: PropTypes.string.isRequired,
    ge: PropTypes.string.isRequired,
    term: PropTypes.string.isRequired,
};

export default withStyles(styles)(SectionTable);
