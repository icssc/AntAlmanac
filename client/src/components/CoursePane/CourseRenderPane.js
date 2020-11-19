import { withStyles } from '@material-ui/core/styles';
import React, { PureComponent } from 'react';
import SchoolDeptCard from './SchoolDeptCard';
import SectionTable from '../SectionTable/SectionTable';
import NoNothing from './static/no_results.png';
import RightPaneStore from '../../stores/RightPaneStore';
import loadingGif from '../SearchForm/Gifs/loading.mp4';
import { DynamicSizeList } from '@john-osullivan/react-window-dynamic-fork';
import AutoSizer from 'react-virtualized-auto-sizer';
import AdBanner from '../AdBanner/AdBanner';

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
    return SOCObject.schools.reduce((accumulator, school) => {
        accumulator.push(school);

        school.departments.forEach((dept) => {
            accumulator.push(dept);

            dept.courses.forEach((course) => {
                accumulator.push(course);
            });
        });

        return accumulator;
    }, []);
};

const SectionTableWrapped = React.forwardRef(({ style, index, data }, ref) => {
    const { courseData, bannerName, bannerLink } = data;

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
    } else {
        component = <SectionTable term={RightPaneStore.getFormData().term} courseDetails={courseData[index]} colorAndDelete={false}/>;
    }
    return (
        <div style={style} ref={ref}>
            {index === 0 ? (
                <AdBanner bannerName={bannerName} bannerLink={bannerLink}/>
            ) : null}
            {component}
        </div>
    );
});

class CourseRenderPane extends PureComponent {
    state = {
        courseData: null,
        loading: true,
        bannerName: '',
        bannerLink: '',
    };

    componentDidMount () {
        this.setState({ loading: true }, async () => {
            const formData = RightPaneStore.getFormData();

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
                room: formData.room,
            };

            const response = await fetch('/api/websocapi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            const jsonResp = await response.json();

            const adBannerInfo = await fetch('/api/ads/getRandomAd');

            const jsonAdInfo = await adBannerInfo.json();

            this.setState({
                loading: false,
                courseData: flattenSOCObject(jsonResp),
                bannerName: jsonAdInfo.bannerName,
                bannerLink: jsonAdInfo.bannerLink,
            });
        });
    }

    render () {
        const { classes } = this.props;
        let currentView;

        if (this.state.loading) {
            currentView = (
                <div className={classes.loadingGifStyle}>
                    <video autoPlay loop>
                        <source src={loadingGif} type="video/mp4"/>
                    </video>
                </div>
            );
        } else {
            const renderData = {
                courseData: this.state.courseData,
                bannerName: this.state.bannerName,
                bannerLink: this.state.bannerLink,
            };

            currentView = (
                <div className={classes.root}>
                    {this.state.courseData.length === 0 ? (
                        <div className={classes.noResultsDiv}>
                            <img src={NoNothing} alt="No Results Found"/>
                        </div>
                    ) : (
                        <AutoSizer>
                            {({ height, width }) => (
                                <DynamicSizeList
                                    height={height - 56}
                                    itemData={renderData}
                                    itemCount={this.state.courseData.length}
                                    width={width}
                                >
                                    {SectionTableWrapped}
                                </DynamicSizeList>
                            )}
                        </AutoSizer>
                    )}
                </div>
            );
        }

        return currentView;
    }
}

export default withStyles(styles)(CourseRenderPane);
