import React from 'react';
import { Grid, CssBaseline, useMediaQuery } from '@material-ui/core';
import Calendar from './Calendar/ScheduleCalendar';
import Bar from './AppBar/CustomAppBar';
import DesktopTabs from './RightPane/RightPaneRoot';
import NotificationSnackbar from './AppBar/NotificationSnackbar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import MobileHome from './MobileHome';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import MomentUtils from '@date-io/moment';

const Home = () => {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    return (
        <LocalizationProvider dateAdapter={MomentUtils}>
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
        </LocalizationProvider>
    );
};

export default Home;
