import React, { Fragment, PureComponent } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Grid } from '@material-ui/core';
import Calendar from '../Calendar/Calendar';
import ReactGA from 'react-ga';
import NotificationSnackbar from './NotificationSnackbar';
import { undoDelete } from '../../actions/AppStoreActions';
import Bar from './CustomAppBar';
import { isMobile } from 'react-device-detect';
import DesktopTabs from './DesktopTabs';

class App extends PureComponent {
    componentDidMount = () => {
        document.addEventListener('keydown', undoDelete, false);

        ReactGA.initialize('UA-133683751-1');
        ReactGA.pageview('/homepage');
    };

    componentWillUnmount() {
        document.removeEventListener('keydown', undoDelete, false);
    }

    render() {
        return (
            <Fragment>
                <CssBaseline />
                <Bar />
                <Grid
                    container
                    alignItems={'stretch'}
                    style={{ flexGrow: '1' }}
                >
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
            </Fragment>
        );
    }
}

export default App;
