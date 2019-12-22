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
import AddedCoursePane from '../AddedCourses/AddedCoursePane';
import NotificationSnackbar from './NotificationSnackbar';
import RightPane from './RightPane';
import { undoDelete } from '../../actions/AppStoreActions';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rightPaneView: 0,
            activeTab: 0,
        };
    }

    componentDidMount = () => {
        document.addEventListener('keydown', undoDelete, false);

        ReactGA.initialize('UA-133683751-1');
        ReactGA.pageview('/homepage');
    };

    componentWillUnmount() {
        document.removeEventListener('keydown', undoDelete, false);
    }

    //what the right panel shows
    handleRightPaneViewChange = (event, rightPaneView) => {
        this.setState({ rightPaneView });
    };

    //change the tab
    handleTabChange = (event, value) => {
        this.setState({ activeTab: value });
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

                        <LoadSaveScheduleFunctionality />

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
                                                    Class Search
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
                                                    Added Classes
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
                                    <AddedCoursePane />
                                ) : (
                                    <RightPane />
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
                <NotificationSnackbar />
            </Fragment>
        );
    }
}

export default App;
