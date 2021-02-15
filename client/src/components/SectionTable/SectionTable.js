import React, { Fragment, PureComponent } from 'react';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AlmanacGraph from '../EnrollmentGraph/EnrollmentGraph';
import CourseInfoBar from './CourseInfoBar';
import SectionTableBody from './SectionTableBody';
import PropTypes from 'prop-types';

const styles = {
    table: {
        borderCollapse: 'collapse',
        boxSizing: 'border-box',
        width: '100%',
        marginTop: '0.285rem',
        marginBottom: '1.25rem',

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
    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <div
                    style={{
                        display: 'inline-flex',
                        marginTop: '4px',
                    }}
                >
                    <CourseInfoBar
                        deptCode={this.props.courseDetails.deptCode}
                        courseTitle={this.props.courseDetails.courseTitle}
                        courseNumber={this.props.courseDetails.courseNumber}
                    />

                    <AlmanacGraph courseDetails={this.props.courseDetails} />

                    {this.props.courseDetails.prerequisiteLink ? (
                        <Typography variant="h6" style={{ flexGrow: '2', marginTop: 9 }}>
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
                            {!this.props.colorAndDelete ? <th>Add</th> : <th style={{ border: 'none' }} />}
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
                                    key={section.sectionCode}
                                    section={section}
                                    courseDetails={this.props.courseDetails}
                                    term={this.props.term}
                                    colorAndDelete={this.props.colorAndDelete}
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
    courseDetails: PropTypes.object.isRequired,
    term: PropTypes.string.isRequired,
    colorAndDelete: PropTypes.bool.isRequired,
};

export default withStyles(styles)(SectionTable);
