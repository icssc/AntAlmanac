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
    state = { courseDetails: this.props.courseDetails };
    constructor(props){
      super(props)
      console.log(this.props)
    }


    componentDidMount = async () => {
        console.log('Section Table');
        console.log(this.props);
        console.log('state');
        console.log(this.state)

    };

    //// TODO: remove this by making addedCoursepane better
    mapcourses = () => {

    }

    render() {
        const { classes, term, currentScheduleIndex } = this.props;
        console.log('check sections')
        console.log(this.state.courseDetails.section)

        return (
            <Fragment>
                <div
                    style={{
                        display: 'inline-flex',
                    }}
                >
                    <CourseInfoBar
                        deptCode={this.state.courseDetails.deptCode}
                        courseTitle={this.state.courseDetails.courseTitle}
                        courseNumber={this.state.courseDetails.courseNumber}
                    />

                    {/*<AlmanacGraphWrapped*/}
                    {/*  term={term}*/}
                    {/*  courseDetails={courseDetails}*/}
                    {/*/>*/}

                    {this.state.courseDetails.prerequisiteLink ? (
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
                                href={this.state.courseDetails.prerequisiteLink}
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
                        {this.state.courseDetails.sections ?
                          (this.state.courseDetails.sections.map((section) => {
                            return (
                                <SectionTableBody
                                    section={section}
                                    courseDetails={this.state.courseDetails}
                                    term={term}
                                />
                            );
                        })):
                        <SectionTableBody
                            courseDetails={this.state.courseDetails}
                            term={term}
                            section = {this.state.courseDetails}
                        />
                      }
                    </tbody>
                </table>
            </Fragment>
        );
    }
}

SectionTable.propTypes = {
    classes: PropTypes.object.isRequired,
    courseDetails: PropTypes.object.isRequired,
};

export default withStyles(styles)(SectionTable);
