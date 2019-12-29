import React, { PureComponent, Suspense } from 'react';
import SearchForm from '../SearchForm/SearchForm';
import loadingGif from '../SearchForm/Gifs/loading.mp4';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import { withStyles } from '@material-ui/core/styles';
import ReactGA from 'react-ga';
import RightPaneStore from '../../stores/RightPaneStore.js';

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

class RightPane extends PureComponent {
    state = {
        courseData: null,
        showSearch: true,
    };

    searchWebSoc = async () => {
        const formData = RightPaneStore.getFormData();
        console.log(formData);
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
                    <CourseRenderPane courseData={this.state.courseData} />
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
