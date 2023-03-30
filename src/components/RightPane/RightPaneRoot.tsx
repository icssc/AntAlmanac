import { Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { FormatListBulleted, MyLocation, Search } from '@material-ui/icons';
import React, { PureComponent, Suspense } from 'react';

import AddedCoursePane from './AddedCourses/AddedCoursePane';
import CoursePane from './CoursePane/CoursePaneRoot';
import darkModeLoadingGif from './CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from './CoursePane/SearchForm/Gifs/loading.gif';
import RightPaneStore, { BuildingFocusInfo } from './RightPaneStore';
import { isDarkMode } from '$lib/helpers';

const UCIMap = React.lazy(() => import('./Map/UCIMap'));

const styles = {
    fallback: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

interface DesktopTabsProps {
    style: Record<string, unknown>;
}

class DesktopTabs extends PureComponent<DesktopTabsProps> {
    state = {
        activeTab: 0,
    };

    changeTab = (activeTab: number) => {
        this.setState({ activeTab: activeTab });
    };

    focusOnBuilding = (buildingInfo: BuildingFocusInfo) => {
        // If the Map tab isn't already active
        if (RightPaneStore.getActiveTab() !== 2) {
            const selectBuilding = () => {
                RightPaneStore.emit('selectBuilding', buildingInfo);
                RightPaneStore.removeListener('mapLoaded', selectBuilding);
            };

            // Map tab will emit 'mapLoaded' when it loads,
            // then we can tell it to focus on a building
            RightPaneStore.on('mapLoaded', selectBuilding);

            // Switch to Map tab
            RightPaneStore.handleTabChange(undefined, 2);
        } else {
            RightPaneStore.emit('selectBuilding', buildingInfo);
        }
    };

    componentDidMount() {
        RightPaneStore.on('tabChange', this.changeTab);
        this.setState({ activeTab: RightPaneStore.getActiveTab() });
        RightPaneStore.on('focusOnBuilding', this.focusOnBuilding);
        // Signal to MobileHome that we're loaded so that it can re-emit 'focusOnBuilding'
        RightPaneStore.emit('RightPaneRootLoaded');
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('tabChange', this.changeTab);
        RightPaneStore.removeListener('focusOnBuilding', this.focusOnBuilding);
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
                currentTab = (
                    <Suspense
                        fallback={
                            <div style={styles.fallback}>
                                <img src={isDarkMode() ? darkModeLoadingGif : loadingGif} alt="Loading map" />
                            </div>
                        }
                    >
                        <UCIMap />
                    </Suspense>
                );
                break;
            default:
                throw RangeError('currentTab index out of range (needs to be 0, 1, or 2)');
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
                        onChange={RightPaneStore.handleTabChange}
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
