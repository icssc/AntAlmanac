import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import React, { Component, Fragment } from 'react';
import SchoolDeptCard from './SchoolDeptCard';
import SectionTable from '../SectionTable/SectionTable.js';
import NoNothing from './static/no_results.png';
import AdAd from './static/ad_ad.png';

const styles = (theme) => ({
    course: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        minHeight: theme.spacing.unit * 6,
        cursor: 'pointer',
    },
    text: {
        flexGrow: 1,
        display: 'inline',
        width: '100%',
    },
    ad: {
        flexGrow: 1,
        display: 'inline',
        width: '100%',
    },
    icon: {
        cursor: 'pointer',
        marginLeft: theme.spacing.unit,
    },
    root: {
        height: '100%',
        position: 'relative',
    },
    noResultsDiv: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

class CourseRenderPane extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseDetailsOpen: false,
            course: null,
        };
    }

    //TODO: HOC for School/Dept separation instead of the solution I got now
    getGrid = (SOCObject) => {
        return (
            <Fragment>
                {SOCObject.schools.map((school) => {
                    return (
                        <Fragment>
                            <SchoolDeptCard
                                comment={school.schoolComment}
                                type={'school'}
                                name={school.schoolName}
                            />
                            {school.departments.map((department) => {
                                return (
                                    <Fragment>
                                        <SchoolDeptCard
                                            name={
                                                'Department of ' +
                                                department.deptName
                                            }
                                            comment={department.deptComment}
                                            type={'dept'}
                                        />
                                        {department.courses.map((course) => (
                                            <Grid item md={12} xs={12}>
                                                <SectionTable
                                                    ge={this.props.ge}
                                                    dept={this.props.dept}
                                                    courseDetails={course}
                                                    term={this.props.term}
                                                />
                                            </Grid>
                                        ))}
                                    </Fragment>
                                );
                            })}
                        </Fragment>
                    );
                })}
            </Fragment>
        );
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                {this.props.courseData.length === 0 ? (
                    <div className={classes.noResultsDiv}>
                        <img src={NoNothing} alt="No Results Found" />
                    </div>
                ) : (
                    <Grid container spacing={16}>
                        <Grid item md={12} xs={12}>
                            <a
                                href="https://forms.gle/irQBrBkqHYYxcEU39"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={AdAd}
                                    alt="This could be you!"
                                    className={classes.ad}
                                />
                            </a>
                        </Grid>
                        {this.getGrid(this.props.courseData)}
                    </Grid>
                )}
            </div>
        );
    }
}

export default withStyles(styles)(CourseRenderPane);
