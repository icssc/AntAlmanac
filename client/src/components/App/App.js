import React, { PureComponent } from 'react';
import { Grid, CssBaseline, createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import Calendar from '../Calendar/ScheduleCalendar';
import ReactGA from 'react-ga';
import NotificationSnackbar from './NotificationSnackbar';
import { undoDelete } from '../../actions/AppStoreActions';
import Bar from './CustomAppBar';
import DesktopTabs from '../CoursePane/DesktopTabs';
import AppStore from '../../stores/AppStore';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

class App extends PureComponent {
    state = {
        darkMode: AppStore.getDarkMode(),
    };

    componentDidMount = () => {
        document.addEventListener('keydown', undoDelete, false);

        AppStore.on('darkModeToggle', () => {
            this.setState({ darkMode: AppStore.getDarkMode() });
        });

        ReactGA.initialize('UA-133683751-1');
        ReactGA.pageview('/homepage');
    };

    componentWillUnmount() {
        document.removeEventListener('keydown', undoDelete, false);
    }

    render() {
        const theme = createMuiTheme({
            overrides: {
                MuiCssBaseline: {
                    '@global': {
                        a: {
                            color: this.state.darkMode ? 'dodgerblue' : 'blue',
                        },
                    },
                },
            },
            palette: {
                type: this.state.darkMode ? 'dark' : 'light',
                primary: {
                    main: '#305db7',
                },
            },
        });

        return (
            <ThemeProvider theme={theme}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <CssBaseline />
                    <Bar />
                    <Grid container alignItems={'stretch'} style={{ flexGrow: '1' }}>
                        <Grid item xs={12} s={6} md={6} lg={6} xl={6}>
                            <Calendar />
                        </Grid>

                        <DesktopTabs />

                        {/*<Hidden mdUp>*/}
                        {/*    <Grid item xs={12}>*/}
                        {/*        <div>*/}
                        {/*            <Tabs*/}
                        {/*                value={this.state.activeTab}*/}
                        {/*                onChange={this.handleTabChange}*/}
                        {/*                variant="fullWidth"*/}
                        {/*                indicatorColor="primary"*/}
                        {/*                textColor="primary"*/}
                        {/*            >*/}
                        {/*                <Tab icon={<CalendarToday />} />*/}
                        {/*                <Tab icon={<Search />} />*/}
                        {/*            </Tabs>*/}
                        {/*        </div>*/}
                        {/*    </Grid>*/}
                        {/*</Hidden>*/}
                    </Grid>
                    <NotificationSnackbar />
                </MuiPickersUtilsProvider>
            </ThemeProvider>
        );
    }
}

export default App;
