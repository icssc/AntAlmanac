import DateFnsUtils from '@date-io/date-fns';
import { CssBaseline, Grid, useMediaQuery } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import React from 'react';

import Bar from './AppBar/CustomAppBar';
import NotificationSnackbar from './AppBar/NotificationSnackbar';
import Calendar from './Calendar/CalendarRoot';
import MobileHome from './MobileHome';
import DesktopTabs from './RightPane/RightPaneRoot';

const Home = () => {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    return (
        <LocalizationProvider dateAdapter={DateFnsUtils}>
            <CssBaseline />
            <Bar />
            {isMobileScreen ? (
                <MobileHome />
            ) : (
                <Grid container alignItems={'stretch'} style={{ flexGrow: '1' }}>
                    <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                        <Calendar isMobile={false} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                        <DesktopTabs style={{ height: 'calc(100vh - 58px)' }} />
                    </Grid>
                </Grid>
            )}
            <NotificationSnackbar />
        </LocalizationProvider>
    );
};

export default Home;
