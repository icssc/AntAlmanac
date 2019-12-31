import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import React, { Fragment, PureComponent, Suspense } from 'react';
import SchoolDeptCard from './SchoolDeptCard';
import SectionTable from '../SectionTable/SectionTable';
import NoNothing from './static/no_results.png';
import AdAd from './static/ad_ad.png';
import RightPaneStore from '../../stores/RightPaneStore';
import loadingGif from '../SearchForm/Gifs/loading.mp4';

// const SectionTable = React.lazy(() =>
//     import('../SectionTable/SectionTable')
// );

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
    loadingGifStyle: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});

class CourseRenderPane extends PureComponent {
    state = {
        courseData: null,
        loading: true,
    };

    componentDidMount() {
        this.setState({ loading: true }, async () => {
            const formData = RightPaneStore.getFormData();
            // console.log(formData);
            // ReactGA.event({
            //     category: 'Search',
            //     action: formData.deptValue,
            //     label: formData.term,
            // });

            const params = {
                department: formData.deptValue,
                term: formData.term,
                ge: formData.ge,
                courseNumber: formData.courseNumber,
                sectionCodes: formData.sectionCodes,
                instructorName: formData.instructor,
                units: formData.units,
                endTime: formData.endTime,
                startTime: formData.startTime,
                fullCourses: formData.coursesFull,
                building: formData.building,
            };

            const response = await fetch('/api/websocapi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            const jsonResp = await response.json();
            this.setState({ loading: false, courseData: jsonResp });
        });
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
                                                    courseDetails={course}
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
        let currentView;

        if (this.state.loading) {
            currentView = (
                <div className={classes.loadingGifStyle}>
                    <video autoPlay loop>
                        <source src={loadingGif} type="video/mp4" />
                    </video>
                </div>
            );
        } else {
            currentView = (
                <div className={classes.root}>
                    {this.state.courseData.length === 0 ? (
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
                            {this.getGrid(this.state.courseData)}
                        </Grid>
                    )}
                </div>
            );
        }

        return currentView;
    }
}

export default withStyles(styles)(CourseRenderPane);
