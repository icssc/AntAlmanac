import React, { PureComponent } from 'react';
import { Grid, Tab, Tabs, Typography, Paper } from '@material-ui/core';
import { FormatListBulleted, MyLocation, Search } from '@material-ui/icons';
import AddedCoursePane from '../AddedCourses/AddedCoursePane';
import RightPane from './RightPane';
import RightPaneStore from '../../stores/RightPaneStore';
import { handleTabChange } from '../../actions/RightPaneActions';
import UCIMap from '../Map/UCIMap';

class DesktopTabs extends PureComponent {
    state = {
        activeTab: 0,
    };

    changeTab = () => {
        this.setState({ activeTab: RightPaneStore.getActiveTab() });
    };

    componentDidMount() {
        RightPaneStore.on('tabChange', this.changeTab);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('tabChange', this.changeTab);
    }

    render() {
        let currentTab;

        if (RightPaneStore.getActiveTab() === 0) {
            currentTab = <RightPane />;
        } else if (RightPaneStore.getActiveTab() === 1) {
            currentTab = <AddedCoursePane />;
        } else if (RightPaneStore.getActiveTab() === 2) {
            currentTab = <UCIMap />;
        }

        return (
            <Grid item xs={12} s={6} md={6} lg={6} xl={6}>
                <div>
                    <Paper
                        elevation={0}
                        variant="outlined"
                        square
                        style={{
                            overflow: 'hidden',
                            marginBottom: '4px',
                            marginRight: '4px',
                        }}
                    >
                        <Tabs
                            value={this.state.activeTab}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            variant="fullWidth"
                            centered
                            style={{ height: '48px' }}
                        >
                            <Tab
                                label={
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Search style={{ height: 16 }} />
                                        <Typography variant="body2">Class Search</Typography>
                                    </div>
                                }
                                style={{
                                    minHeight: 'auto',
                                    height: '44px',
                                    padding: 3,
                                }}
                            />
                            <Tab
                                label={
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <FormatListBulleted style={{ height: 16 }} />
                                        <Typography variant="body2">Added Classes</Typography>
                                    </div>
                                }
                                style={{
                                    minHeight: 'auto',
                                    height: '44px',
                                    padding: 3,
                                }}
                            />
                            <Tab
                                label={
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <MyLocation style={{ height: 16 }} />
                                        <Typography variant="body2">Map</Typography>
                                    </div>
                                }
                                style={{
                                    minHeight: 'auto',
                                    height: '44px',
                                    padding: 3,
                                }}
                            />
                        </Tabs>
                    </Paper>
                    <div
                        style={{
                            padding: RightPaneStore.getActiveTab() === 2 ? '0px' : '8px',
                            height: `calc(100vh - 104px)`,
                            overflowY: RightPaneStore.getActiveTab() === 1 ? 'auto' : 'hidden',
                        }}
                    >
                        {currentTab}
                    </div>
                </div>
            </Grid>
        );
    }
}

//TODO: Mobile

export default DesktopTabs;
