import React, { PureComponent, Fragment } from 'react';

import CourseRenderPane from './CourseRenderPane';
import { IconButton, Tooltip } from '@material-ui/core';
import { ArrowBack, Dns, ListAlt, Refresh } from '@material-ui/icons';
import ReactGA from 'react-ga';

class CoursePane extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            courseData: this.props.Data,
        };
    }

    render() {
        const courseData = this.state.courseData;
        const { view, Data } = this.props;

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
                    onToggleDismissButton={this.handleToggleDismissButton}
                    courseData={courseData}
                    view={view}
                    term={this.props.term}
                    ge={this.props.ge}
                    dept={this.props.dept}
                />
            </Fragment>
        );
    }
}

export default CoursePane;
