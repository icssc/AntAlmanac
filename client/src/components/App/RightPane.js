import React, { Component, Suspense } from 'react';
import SearchForm from '../SearchForm/SearchForm';
import loadingGif from '../SearchForm/Gifs/loading.mp4';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import { withStyles } from '@material-ui/core/styles';
import ReactGA from 'react-ga';

const CourseRenderPane = React.lazy(() =>
    import('../CoursePane/CourseRenderPane')
);

const styles = {
    loadingGifStyle: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
};

class RightPane extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseData: null,
            showSearch: true,
        };
    }

    searchWebSoc = async ({
        dept,
        term,
        ge,
        courseNum,
        courseCode,
        instructor,
        units,
        endTime,
        startTime,
        coursesFull,
        building,
    }) => {
        ReactGA.event({
            category: 'Search',
            action: dept,
            label: term,
        });

        const params = {
            department: dept,
            term: term,
            ge: ge,
            courseNumber: courseNum,
            sectionCodes: courseCode,
            instructorName: instructor,
            units: units,
            endTime: endTime,
            startTime: startTime,
            fullCourses: coursesFull,
            building: building,
        };

        const response = await fetch('/api/websocapi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });

        const jsonResp = await response.json();

        this.setState({ courseData: jsonResp, showSearch: false });
    };

    handleDismissSearchResults = () => {
        this.setState({ showSearch: true, courseData: null });
    };

    render() {
        const { classes } = this.props;
        let currentView;

        if (this.state.showSearch) {
            currentView = <SearchForm searchWebSoc={this.searchWebSoc} />;
        } else {
            currentView = (
                <Suspense
                    fallback={
                        <div className={classes.loadingGifStyle}>
                            <video autoPlay loop>
                                <source src={loadingGif} type="video/mp4" />
                            </video>
                        </div>
                    }
                >
                    <CourseRenderPane
                        courseData={this.state.courseData}
                        // term={this.props.term}
                        // ge={this.props.ge}
                        // dept={this.props.dept}
                    />
                </Suspense>
            );
        }

        return (
            <div>
                <CoursePaneButtonRow
                    show={!this.state.showSearch}
                    onDismissSearchResults={this.handleDismissSearchResults}
                />
                {currentView}
            </div>
        );
    }
}

RightPane.propTypes = {};

export default withStyles(styles)(RightPane);
