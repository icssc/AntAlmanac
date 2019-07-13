import React, { PureComponent, Fragment } from 'react';
import loadingGif from './static/loading.mp4';
import CourseRenderPane from './CourseRenderPane';
import { IconButton, Tooltip } from '@material-ui/core';
import { ArrowBack, Dns, ListAlt, Refresh } from '@material-ui/icons';
import ReactGA from 'react-ga';

class CoursePane extends PureComponent {
    state = {
        courseData: null,
        loading: true,
    };

    componentDidMount = async () => {
        await this.fetchSearch();
    };

    fetchSearch = async () => {
        this.setState({ loading: true }, async () => {
            const {
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
            } = this.props.formData;

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

            this.setState({
                courseData: jsonResp,
                loading: false,
            });
        });
    };

    render() {
        const { loading, courseData } = this.state;
        const { view, formData } = this.props;

        if (loading === false) {
            return (
                <Fragment>
                    <div
                        style={{
                            position: 'sticky',
                            width: '100%',
                            top: 0,
                            zIndex: 3,
                            marginBottom: 8,
                        }}
                    >
                        <Tooltip title="Back">
                            <IconButton
                                onClick={this.props.onDismissSearchResults}
                                style={{
                                    backgroundColor: 'rgba(236, 236, 236, 1)',
                                    marginRight: 5,
                                    boxShadow: 2,
                                }}
                            >
                                <ArrowBack />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={view ? 'List View' : 'Title View'}>
                            <IconButton
                                onClick={() =>
                                    this.setState({ view: view === 0 ? 1 : 0 })
                                } //TODO: Make this toggleView func
                                style={{
                                    backgroundColor: 'rgba(236, 236, 236, 1)',
                                    marginRight: 5,
                                    boxShadow: 2,
                                }}
                            >
                                {view ? <ListAlt /> : <Dns />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Refresh Search Results">
                            <IconButton
                                onClick={this.fetchSearch}
                                style={{
                                    backgroundColor: 'rgba(236, 236, 236, 1)',
                                    boxShadow: 2,
                                }}
                            >
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <CourseRenderPane
                        formData={formData}
                        onToggleDismissButton={this.handleToggleDismissButton}
                        courseData={courseData}
                        view={view}
                        currentScheduleIndex={this.props.currentScheduleIndex}
                        term={this.props.formData.term}
                    />
                </Fragment>
            );
        } else {
            return (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white',
                    }}
                >
                    <video autoPlay loop>
                        <source src={loadingGif} type="video/mp4" />
                    </video>
                </div>
            );
        }
    }
}

export default CoursePane;
