import React, { Fragment, PureComponent } from 'react';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AlmanacGraph from '../EnrollmentGraph/EnrollmentGraph';
import CourseInfoBar from './CourseInfoBar';
import SectionTableBody from './SectionTableBody';
import PropTypes from 'prop-types';
import RightPaneStore from '../../stores/RightPaneStore';
import { WEBSOC_ENDPOINT } from '../../api/endpoints';

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
    state = {
        courseDetails: this.props.courseDetails,
    };

    async componentDidMount() {
        const formData = RightPaneStore.getFormData();

        if (formData.ge !== 'ANY') {
            const params = {
                department: this.props.courseDetails.deptCode,
                term: formData.term,
                ge: 'ANY',
                courseNumber: this.props.courseDetails.courseNumber,
            };

            const response = await fetch(WEBSOC_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            const jsonResp = await response.json();

            this.setState({
                courseDetails: jsonResp.schools[0].departments[0].courses[0],
            });
        }
    }

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
                        deptCode={this.state.courseDetails.deptCode}
                        courseTitle={this.state.courseDetails.courseTitle}
                        courseNumber={this.state.courseDetails.courseNumber}
                    />

                    <AlmanacGraph courseDetails={this.state.courseDetails} />

                    {this.state.courseDetails.prerequisiteLink ? (
                        <Typography variant="h6" style={{ flexGrow: '2', marginTop: 9 }}>
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
                        {this.state.courseDetails.sections.map((section) => {
                            return (
                                <SectionTableBody
                                    section={section}
                                    courseDetails={this.state.courseDetails}
                                    term={term}
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
