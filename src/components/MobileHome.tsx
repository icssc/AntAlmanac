import { Paper ,Tab, Tabs } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import Calendar from './Calendar/CalendarRoot';
import DesktopTabs from './RightPane/RightPaneRoot';
import RightPaneStore from './RightPane/RightPaneStore';

const MobileHome = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const components = [
    <Calendar isMobile={true} key="calendar"/>, 
    <DesktopTabs style={{ height: 'calc(100% - 50px' }} key="desktop"/>];
    
    interface FocusOnBuildingArgs {
        lat: number
        lng: number
        name: string
        acronym: string
        imgURL: string
    }
    const focusOnBuilding = (buildingInfo: FocusOnBuildingArgs) => {
        // Since MobileHome doesn't have DesktopTabs permanently loaded,
        // we need to switch over to it, get a confirmation that it's loaded,
        // then re-emit 'focusOnBuilding'

        if (selectedTab !== 1) {
            const reEmitFocus = () => {
                RightPaneStore.emit('focusOnBuilding', buildingInfo);
                RightPaneStore.removeListener('RightPaneRootLoaded', reEmitFocus);
            };

            // Switch to DesktopTabs
            setSelectedTab(1);
            RightPaneStore.on('RightPaneRootLoaded', reEmitFocus);
        }
    };

    useEffect(() => {
        RightPaneStore.on('focusOnBuilding', focusOnBuilding);
        return () => {RightPaneStore.removeListener('focusOnBuilding', focusOnBuilding)}
    });

    return (
        <div style={{ height: 'calc(100% - 60px)' }}>
            <Paper elevation={0} variant="outlined" square style={{ margin: '4px', height: '50px' }}>
                <Tabs
                    value={selectedTab}
                    onChange={(_, value: number) => {
                        setSelectedTab(value);
                    }}
                    indicatorColor="primary"
                    variant="fullWidth"
                    centered
                    style={{
                        height: '100%',
                    }}
                >
                    <Tab label={<div>Calendar</div>} />
                    <Tab label={<div>Search</div>} />
                </Tabs>
            </Paper>
            {components[selectedTab]}
        </div>
    );
};

export default MobileHome;
