import React from 'react';
import { Grid, CssBaseline, useMediaQuery } from '@material-ui/core';
import Calendar from '../Calendar/ScheduleCalendar';
import Bar from './CustomAppBar';
import DesktopTabs from '../CoursePane/DesktopTabs';
import NotificationSnackbar from './NotificationSnackbar';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MobileHome from './MobileHome';
import DateFnsUtils from '@date-io/date-fns';

const Home = () => {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />
            <Bar />
            {isMobileScreen ? (
                <MobileHome />
            ) : (
                <Grid container alignItems={'stretch'} style={{ flexGrow: '1' }}>
                    <Grid item xs={12} s={6} md={6} lg={6} xl={6}>
                        <Calendar />
                    </Grid>
                    <Grid item xs={12} s={6} md={6} lg={6} xl={6}>
                        <DesktopTabs style={{ height: 'calc(100vh - 58px)' }} />
                    </Grid>
                </Grid>
            )}
            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
};

export default Home;
