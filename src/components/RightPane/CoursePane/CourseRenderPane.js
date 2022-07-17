import { withStyles } from '@material-ui/core/styles';
import React, { PureComponent } from 'react';
import SchoolDeptCard from './SchoolDeptCard';
import SectionTable from '../SectionTable/SectionTable';
import noNothing from './static/no_results.png';
import darkNoNothing from './static/dark-no_results.png';
import AppStore from '../../../stores/AppStore';
import RightPaneStore from '../../../stores/RightPaneStore';
import loadingGif from './SearchForm/Gifs/loading.gif';
import darkModeLoadingGif from './SearchForm/Gifs/dark-loading.gif';
import GeDataFetchProvider from '../SectionTable/GEDataFetchProvider';
import LazyLoad from 'react-lazyload';
import { queryWebsoc, queryWebsocMultiple, isDarkMode } from '../../../helpers';
import analyticsEnum from '../../../analytics';

const styles = (theme) => ({
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
        paddingTop: '50px',
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
});

const flattenSOCObject = (SOCObject) => {
    const courseColors = AppStore.getAddedCourses().reduce((accumulator, { color, section }) => {
        accumulator[section.sectionCode] = color;
        return accumulator;
    }, {});
    return SOCObject.schools.reduce((accumulator, school) => {
        accumulator.push(school);

        school.departments.forEach((dept) => {
            accumulator.push(dept);

            dept.courses.forEach((course) => {
                for (const section of course.sections) {
                    section.color = courseColors[section.sectionCode];
                }
                accumulator.push(course);
            });
        });

        return accumulator;
    }, []);
};

const SectionTableWrapped = (index, data) => {
    const { courseData, scheduleNames } = data;
    const formData = RightPaneStore.getFormData();

    let component;

    if (courseData[index].departments !== undefined) {
        component = (
            <SchoolDeptCard
                comment={courseData[index].schoolComment}
                type={'school'}
                name={courseData[index].schoolName}
            />
        );
    } else if (courseData[index].courses !== undefined) {
        component = (
            <SchoolDeptCard
                name={`Department of ${courseData[index].deptName}`}
                comment={courseData[index].deptComment}
                type={'dept'}
            />
        );
    } else if (formData.ge !== 'ANY') {
        component = (
            <GeDataFetchProvider
                term={formData.term}
                courseDetails={courseData[index]}
                colorAndDelete={false}
                highlightAdded={true}
                scheduleNames={scheduleNames}
            />
        );
    } else {
        component = (
            <SectionTable
                term={formData.term}
                courseDetails={courseData[index]}
                colorAndDelete={false}
                highlightAdded={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch.title}
            />
        );
    }

    return <div>{component}</div>;
};

class CourseRenderPane extends PureComponent {
    state = {
        courseData: null,
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
                    {this.state.courseData.length === 0 ? (
                        <div className={classes.noResultsDiv}>
                            <img src={isDarkMode() ? darkNoNothing : noNothing} alt="No Results Found" />
                        </div>
                    ) : (
                        this.state.courseData.map((_, index) => {
                            let heightEstimate = 300;
                            if (this.state.courseData[index].sections !== undefined)
                                heightEstimate = this.state.courseData[index].sections.length * 60 + 20 + 40;

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
