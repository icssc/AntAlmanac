import React, { PureComponent } from 'react';
import { Tab, Tabs, Typography, Paper } from '@material-ui/core';
import { FormatListBulleted, MyLocation, Search } from '@material-ui/icons';
import AddedCoursePane from './AddedCourses/AddedCoursePane';
import CoursePane from './CoursePane/CoursePaneRoot';
import RightPaneStore from '../../stores/RightPaneStore';
import { handleTabChange } from '../../actions/RightPaneActions';
import UCIMap from './Map/UCIMap';

class DesktopTabs extends PureComponent {
    state = {
        activeTab: 0,
    };

    changeTab = (activeTab) => {
        this.setState({ activeTab: activeTab });
    };

    componentDidMount() {
        RightPaneStore.on('tabChange', this.changeTab);
        this.setState({ activeTab: RightPaneStore.getActiveTab() });
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('tabChange', this.changeTab);
    }

    render() {
        const { style } = this.props;
        let currentTab;
        switch (RightPaneStore.getActiveTab()) {
            case 0:
                currentTab = <CoursePane />;
                break;
            case 1:
                currentTab = <AddedCoursePane />;
                break;
            case 2:
                currentTab = <UCIMap />;
                break;
            default:
                throw RangeError('currentTab index our of range (needs to be 0,1, or 2)');
        }

        return (
            <div style={style}>
                <Paper
                    elevation={0}
                    variant="outlined"
                    square
                    style={{
                        overflow: 'hidden',
                        margin: '0 4px 4px 4px',
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
                        padding: RightPaneStore.getActiveTab() === 2 ? '0px' : '8px 8px 0 8px',
                        height: `calc(100% - 54px)`,
                        overflowY: 'auto',
                    }}
                >
                    {currentTab}
                </div>
            </div>
        );
    }
}

export default DesktopTabs;
