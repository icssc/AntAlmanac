import React, { useState } from 'react';
import { Tab, Tabs, Paper } from '@material-ui/core';
import DesktopTabs from './RightPane/RightPaneRoot';
import Calendar from './Calendar/ScheduleCalendar';

const MobileHome = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const components = [<Calendar isMobile={true} />, <DesktopTabs style={{ height: 'calc(100% - 50px' }} />];

    return (
        <div style={{ height: 'calc(100% - 60px)' }}>
            <Paper elevation={0} variant="outlined" square style={{ margin: '4px', height: '50px' }}>
                <Tabs
                    value={selectedTab}
                    onChange={(_, value) => {
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
