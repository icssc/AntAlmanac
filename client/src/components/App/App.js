import React, { Component, Suspense, Fragment } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
    Grid,
    Toolbar,
    AppBar,
    Tooltip,
    Tabs,
    Hidden,
    Tab,
    Typography,
    Button,
} from '@material-ui/core';
import SearchForm from '../SearchForm/SearchForm';
import Calendar from '../Calendar/Calendar';
import {
    Info,
    Search,
    CalendarToday,
    Assignment,
    FormatListBulleted,
} from '@material-ui/icons';
import LoadSaveScheduleFunctionality from '../cacheMes/LoadSaveFunctionality';
import ReactGA from 'react-ga';
import loadingGif from '../CoursePane/static/loading.mp4';
import { saveUserData } from '../../helpers';
import TabularView from './TabularView';

const CoursePane = React.lazy(() => import('../CoursePane/CoursePane'));

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            prevFormData: null,
            formData: null,
            currentScheduleIndex: 0,
            showSearch: true,
            customEvents: [],
            addedCourses: [],
            backupArray: [],
            userID: null,
            rightPaneView: 0,
            showFinalSchedule: false,
            activeTab: 0,
        };
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.handleUndo, false);

        ReactGA.initialize('UA-133683751-1');
        ReactGA.pageview('/homepage');
    };

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleUndo, false);
    }

    handleRightPaneViewChange = (event, rightPaneView) => {
        this.setState({ rightPaneView, showSearch: true });
    };

    handleTabChange = (event, value) => {
        this.setState({ activeTab: value });
    };

    handleCopySchedule = (moveTo) => {
        // let allSchedules = [0, 1, 2, 3];
        // let schedulesToMoveTo = [];
        // //if move to all schedules
        // if (moveTo === 4) {
        //   allSchedules.forEach((schedule) => {
        //     if (schedule !== this.state.currentScheduleIndex) {
        //       schedulesToMoveTo.push(schedule);
        //     }
        //   });
        // } else {
        //   schedulesToMoveTo.push(moveTo);
        // }
        //
        // // for each schedule index to add to
        // let newCourses = [];
        // schedulesToMoveTo.forEach((schedule) => {
        //   newCourses = newCourses.concat(this.getClassesAfterCopyingTo(schedule));
        //   this.setState({
        //     courseEvents: this.state.courseEvents.concat(newCourses),
        //   });
        // });
    };

    getClassesAfterCopyingTo = (moveTo) => {
        // let moveFrom = this.state.currentScheduleIndex;
        // const oldClasses = this.state.courseEvents.filter(
        //   (courseEvent) => courseEvent.scheduleIndex === moveFrom
        // );
        // let newCourses = [];
        // oldClasses.forEach((oldClass) => {
        //   let newClass = Object.assign({}, oldClass);
        //   newClass.scheduleIndex = moveTo;
        //   newCourses.push(newClass);
        // });
        // return newCourses;
    };

    handleDismissSearchResults = () => {
        this.setState({ showSearch: true, formData: null });
    };

    updateFormData = (formData) => {
        this.setState({ formData: formData, prevFormData: formData }, () =>
            this.setState({ showSearch: false })
        );
    };

    handleEditCustomEvent = (newEvents, oldEvent) => {
        // let newCourseEvents = this.state.courseEvents.filter(
        //   (courseEvent) =>
        //     !courseEvent.isCustomEvent ||
        //     courseEvent.customEventID !== oldEvent.customEventID ||
        //     courseEvent.scheduleIndex !== oldEvent.scheduleIndex
        // );
        // this.setState({ courseEvents: newCourseEvents.concat(newEvents) });
    };

    displayFinal = (schedule) => {
        this.setState(
            {
                showFinalSchedule: !this.state.showFinalSchedule,
            },
            () => {
                if (this.state.showFinalSchedule) {
                    this.setState({ finalSchedule: schedule });
                }
            }
        );
    };

    render() {
        return (
            <Fragment>
                <CssBaseline />
                <AppBar
                    position="static"
                    style={{
                        marginBottom: '4px',
                        boxShadow: 'none',
                        backgroundColor: '#305db7',
                    }}
                >
                    <Toolbar variant="dense">
                        <div style={{ flexGrow: 1 }}>{/*    LOGO*/}</div>

                        <LoadSaveScheduleFunctionality
                            onLoad={this.handleLoad}
                            onSave={this.handleSave}
                            isDesktop={this.state.isDesktop}
                        />

                        {this.state.isDesktop ? (
                            <Tooltip title="Give Us Feedback!">
                                <Button
                                    onClick={() => {
                                        window.open(
                                            'https://goo.gl/forms/eIHy4kp56pZKP9fK2',
                                            '_blank'
                                        );
                                    }}
                                    color="inherit"
                                >
                                    <Assignment />
                                    <Typography color="inherit">
                                        &nbsp;&nbsp;Feedback
                                    </Typography>
                                </Button>
                            </Tooltip>
                        ) : (
                            <Fragment />
                        )}

                        <Tooltip title="Info Page">
                            <Button
                                onClick={() => {
                                    window.open(
                                        'https://www.ics.uci.edu/~rang1/AntAlmanac/index.html',
                                        '_blank'
                                    );
                                }}
                                color="inherit"
                            >
                                <Info />
                                {this.state.isDesktop ? (
                                    <Typography color="inherit">
                                        &nbsp;&nbsp;About
                                    </Typography>
                                ) : (
                                    <Fragment />
                                )}
                            </Button>
                        </Tooltip>
                    </Toolbar>
                </AppBar>
                <Grid container>
                    <Grid item xs={12} s={6} md={6} lg={6} xl={6}>
                        <div
                            style={{
                                display:
                                    this.state.activeTab === 0 ||
                                    this.state.isDesktop
                                        ? 'block'
                                        : 'none',
                            }}
                        >
                            <Calendar />
                        </div>
                    </Grid>

                    <Grid item xs={12} s={6} md={6} lg={6} xl={6}>
                        <div
                            style={{
                                display:
                                    this.state.activeTab === 0
                                        ? 'block'
                                        : 'none',
                            }}
                        >
                            <div
                                style={{
                                    overflow: 'hidden',
                                    marginBottom: '4px',
                                    marginRight: '4px',
                                    backgroundColor: '#dfe2e5',
                                }}
                            >
                                <Tabs
                                    value={this.state.rightPaneView}
                                    onChange={this.handleRightPaneViewChange}
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="fullWidth"
                                    centered
                                >
                                    <Tab
                                        label={
                                            <div
                                                style={{
                                                    display: 'inline-flex',
                                                }}
                                            >
                                                <Search
                                                    style={{ height: 20 }}
                                                />
                                                <Typography>
                                                    &nbsp;&nbsp;Class Search
                                                </Typography>
                                            </div>
                                        }
                                    />
                                    <Tab
                                        label={
                                            <div
                                                style={{
                                                    display: 'inline-flex',
                                                }}
                                            >
                                                <FormatListBulleted
                                                    style={{ height: 20 }}
                                                />
                                                <Typography>
                                                    &nbsp;&nbsp;Added Classes
                                                </Typography>
                                            </div>
                                        }
                                    />
                                </Tabs>
                            </div>
                            <div
                                style={{
                                    overflow: 'auto',
                                    padding: 10,
                                    height: `calc(100vh - 96px - 12px - ${
                                        this.state.isDesktop ? '0px' : '48px'
                                    })`,
                                    marginRight: 4,
                                    boxShadow: 'none',
                                }}
                                id="rightPane"
                            >
                                {this.state.rightPaneView ? (
                                    <Fragment />
                                ) : this.state.showSearch ? (
                                    <SearchForm
                                        prevFormData={this.state.prevFormData}
                                        updateFormData={this.updateFormData}
                                    />
                                ) : (
                                    <Suspense
                                        fallback={
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
                                                    <source
                                                        src={loadingGif}
                                                        type="video/mp4"
                                                    />
                                                </video>
                                            </div>
                                        }
                                    >
                                        <CoursePane
                                            formData={this.state.formData}
                                            onAddClass={this.handleAddClass}
                                            onDismissSearchResults={
                                                this.handleDismissSearchResults
                                            }
                                        />
                                    </Suspense>
                                )}
                            </div>
                        </div>
                    </Grid>

                    <Hidden mdUp>
                        <Grid item xs={12}>
                            <div>
                                <Tabs
                                    value={this.state.activeTab}
                                    onChange={this.handleTabChange}
                                    variant="fullWidth"
                                    indicatorColor="primary"
                                    textColor="primary"
                                >
                                    <Tab icon={<CalendarToday />} />
                                    <Tab icon={<Search />} />
                                </Tabs>
                            </div>
                        </Grid>
                    </Hidden>
                </Grid>
            </Fragment>
        );
    }
}

export default App;
