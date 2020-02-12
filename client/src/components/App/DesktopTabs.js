import React, { PureComponent } from 'react';
import { Grid, Tab, Tabs, Typography } from '@material-ui/core';
import { FormatListBulleted, MyLocation, Search } from '@material-ui/icons';
import AddedCoursePane from '../AddedCourses/AddedCoursePane';
import RightPane from './RightPane';
import RightPaneStore from '../../stores/RightPaneStore';
import { handleTabChange } from '../../actions/RightPaneActions';
import UCIMap from '../Map/UCIMap';

const styles = {};

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
                    <div
                        style={{
                            overflow: 'hidden',
                            marginBottom: '4px',
                            marginRight: '4px',
                            backgroundColor: '#dfe2e5',
                        }}
                    >
                        <Tabs
                            value={this.state.activeTab}
                            onChange={handleTabChange}
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
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Search style={{ height: 16 }} />
                                        <Typography>Class Search</Typography>
                                    </div>
                                }
                            />
                            <Tab
                                label={
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <FormatListBulleted
                                            style={{ height: 16 }}
                                        />
                                        <Typography>Added Classes</Typography>
                                    </div>
                                }
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
                                        <Typography>Map</Typography>
                                    </div>
                                }
                            />
                        </Tabs>
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            height: `calc(100vh - 104px)`,
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
