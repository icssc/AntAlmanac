import React, { PureComponent } from 'react';
import LazyLoad from 'react-lazyload';
import { Button, Grid, Paper, Theme } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import CloseIcon from '@material-ui/icons/Close';
import analyticsEnum from '$lib/analytics';
import { isDarkMode, queryWebsoc, queryWebsocMultiple } from '$lib/helpers';
import { AACourse, AASection, Department, School, WebsocResponse } from '$lib/peterportal.types';
import AppStore from '$stores/AppStore';
import RightPaneStore from '../RightPaneStore';
import GeDataFetchProvider from '../SectionTable/GEDataFetchProvider';
import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';
import SchoolDeptCard from './SchoolDeptCard';
import darkModeLoadingGif from './SearchForm/Gifs/dark-loading.gif';
import loadingGif from './SearchForm/Gifs/loading.gif';
import darkNoNothing from './static/dark-no_results.png';
import noNothing from './static/no_results.png';

const styles: Styles<Theme, object> = (theme) => ({
    course: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing(),
        paddingBottom: theme.spacing(),
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        minHeight: theme.spacing(6),
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
        marginLeft: theme.spacing(),
    },
    root: {
        height: '100%',
        overflowY: 'scroll',
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
    },
    bannerContainer: {
        height: '50px',
        paddingLeft: '110px',
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: '0px',
        marginBottom: '5px',
    },
    bannerGrid: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
});

const flattenSOCObject = (SOCObject: WebsocResponse): (School | Department | AACourse)[] => {
    const courseColors = AppStore.getAddedCourses().reduce((accumulator, { color, section }) => {
        accumulator[section.sectionCode] = color;
        return accumulator;
    }, {} as { [key: string]: string });
    return SOCObject.schools.reduce((accumulator: (School | Department | AACourse)[], school) => {
        accumulator.push(school);

        school.departments.forEach((dept) => {
            accumulator.push(dept);

            dept.courses.forEach((course) => {
                for (const section of course.sections) {
                    (section as AASection).color = courseColors[section.sectionCode];
                }
                accumulator.push(course as AACourse);
            });
        });

        return accumulator;
    }, []);
};
const RecruitmentBanner = (classes: ClassNameMap) => {
    const [bannerVisibility, setBannerVisibility] = React.useState<boolean>(true);

    // Display recruitment banner if more than 11 weeks (in ms) has passed since last dismissal
    const displayRecruitmentBanner =
        bannerVisibility &&
        (window.localStorage.getItem('recruitmentDismissalTime') === null ||
            (Date.now() - parseInt(window.localStorage.getItem('recruitmentDismissalTime') as string) >
                11 * 7 * 24 * 3600 * 1000 &&
                ['COMPSCI', 'IN4MATX', 'I&C SCI', 'STATS'].includes(RightPaneStore.getFormData().deptValue)));

    return (
        <div className={classes.bannerContainer}>
            {displayRecruitmentBanner ? (
                <Paper elevation={1} square>
                    <Grid container className={classes.bannerGrid}>
                        <div style={{ paddingLeft: '30px' }}>
                            Interested in web development?
                            <br />
                            <a href="https://forms.gle/v32Cx65vwhnmxGPv8" target="__blank" rel="noopener noreferrer">
                                Join ICSSC and work on AntAlmanac and other projects!
                            </a>
                            <br />
                            We have opportunities for experienced devs and those with zero experience!
                        </div>

                        <Button
                            onClick={() => {
                                // Unix  time in seconds
                                window.localStorage.setItem('recruitmentDismissalTime', Date.now().toString());
                                setBannerVisibility(false);
                            }}
                            color="inherit"
                            startIcon={<CloseIcon />}
                        ></Button>
                    </Grid>
                </Paper>
            ) : null}{' '}
        </div>
    );
};

/* TODO: all this typecasting in the conditionals is pretty messy, but type guards don't really work in this context
 *  for reasons that are currently beyond me (probably something in the transpiling process that JS doesn't like).
 *  If you can find a way to make this cleaner, do it.
 */
const SectionTableWrapped = (
    index: number,
    data: { scheduleNames: string[]; courseData: (School | Department | AACourse)[] }
) => {
    const { courseData, scheduleNames } = data;
    const formData = RightPaneStore.getFormData();

    let component;

    if ((courseData[index] as School).departments !== undefined) {
        const school = courseData[index] as School;
        component = <SchoolDeptCard comment={school.schoolComment} type={'school'} name={school.schoolName} />;
    } else if ((courseData[index] as Department).courses !== undefined) {
        const dept = courseData[index] as Department;
        component = <SchoolDeptCard name={`Department of ${dept.deptName}`} comment={dept.deptComment} type={'dept'} />;
    } else if (formData.ge !== 'ANY') {
        const course = courseData[index] as AACourse;
        component = (
            <GeDataFetchProvider
                term={formData.term}
                courseDetails={course}
                colorAndDelete={false}
                highlightAdded={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch.title}
            />
        );
    } else {
        const course = courseData[index] as AACourse;
        component = (
            <SectionTableLazyWrapper
                term={formData.term}
                courseDetails={course}
                colorAndDelete={false}
                highlightAdded={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch.title}
            />
        );
    }

    return <div>{component}</div>;
};

interface CourseRenderPaneProps {
    classes: ClassNameMap;
}

interface CourseRenderPaneState {
    courseData: (School | Department | AACourse)[];
    loading: boolean;
    error: boolean;
    scheduleNames: string[];
}

class CourseRenderPane extends PureComponent<CourseRenderPaneProps, CourseRenderPaneState> {
    state: CourseRenderPaneState = {
        courseData: [],
        loading: true,
        error: false,
        scheduleNames: AppStore.getScheduleNames(),
    };

    loadCourses = () => {
        this.setState({ loading: true }, async () => {
            const formData = RightPaneStore.getFormData();

            const params = {
                department: formData.deptValue,
                term: formData.term,
                ge: formData.ge,
                courseNumber: formData.courseNumber,
                sectionCodes: formData.sectionCode,
                instructorName: formData.instructor,
                units: formData.units,
                endTime: formData.endTime,
                startTime: formData.startTime,
                fullCourses: formData.coursesFull,
                building: formData.building,
                room: formData.room,
            };

            try {
                let jsonResp;
                if (params.units.includes(',')) {
                    jsonResp = await queryWebsocMultiple(params, 'units');
                } else {
                    jsonResp = await queryWebsoc(params);
                }
                this.setState({
                    loading: false,
                    error: false,
                    courseData: flattenSOCObject(jsonResp),
                });
            } catch (error) {
                this.setState({
                    loading: false,
                    error: true,
                });
            }
        });
    };

    componentDidMount() {
        this.loadCourses();
        AppStore.on('scheduleNamesChange', this.updateScheduleNames);
    }

    componentWillUnmount() {
        AppStore.removeListener('scheduleNamesChange', this.updateScheduleNames);
    }

    updateScheduleNames = () => {
        this.setState({ scheduleNames: AppStore.getScheduleNames() });
    };

    render() {
        const { classes } = this.props;
        let currentView;

        if (this.state.loading) {
            currentView = (
                <div className={classes.loadingGifStyle}>
                    <img src={isDarkMode() ? darkModeLoadingGif : loadingGif} alt="Loading courses" />
                </div>
            );
        } else if (!this.state.error) {
            const renderData = {
                courseData: this.state.courseData,
                scheduleNames: this.state.scheduleNames,
            };

            currentView = (
                <div className={classes.root}>
                    <RecruitmentBanner {...classes} />
                    {this.state.courseData.length === 0 ? (
                        <div className={classes.noResultsDiv}>
                            <img src={isDarkMode() ? darkNoNothing : noNothing} alt="No Results Found" />
                        </div>
                    ) : (
                        this.state.courseData.map((_: School | Department | AACourse, index: number) => {
                            let heightEstimate = 200;
                            if ((this.state.courseData[index] as AACourse).sections !== undefined)
                                heightEstimate =
                                    (this.state.courseData[index] as AACourse).sections.length * 60 + 20 + 40;

                            return (
                                <LazyLoad once key={index} overflow height={heightEstimate} offset={500}>
                                    {SectionTableWrapped(index, renderData)}
                                </LazyLoad>
                            );
                        })
                    )}
                </div>
            );
        } else {
            currentView = (
                <div className={classes.root}>
                    <div className={classes.noResultsDiv}>
                        <img src={isDarkMode() ? darkNoNothing : noNothing} alt="No Results Found" />
                    </div>
                </div>
            );
        }

        return currentView;
    }
}

export default withStyles(styles)(CourseRenderPane);
