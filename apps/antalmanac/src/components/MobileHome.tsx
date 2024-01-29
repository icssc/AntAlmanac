import { useParams } from 'react-router-dom';
import { useEffect, useState, createContext } from 'react';
import { Paper, Tab, Tabs } from '@material-ui/core';
import Calendar from './Calendar/CalendarRoot';
import DesktopTabs from './RightPane/RightPaneRoot';

const components = [
    <Calendar isMobile={true} key="calendar" />,
    <DesktopTabs style={{ height: 'calc(100% - 50px' }} key="desktop" />,
];

export type MobileContext = {
    setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
};

export const mobileContext = createContext<MobileContext>({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setSelectedTab: () => {},
});

const MobileHome = () => {
    const [selectedTab, setSelectedTab] = useState(localStorage.getItem('userID') ? 0 : 1);
    const params = useParams();

    useEffect(() => {
        if (params.tab === 'map') {
            setSelectedTab(1);
        }
    }, [params, setSelectedTab]);

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
                    <Tab label={<div>Classes</div>} />
                </Tabs>
            </Paper>
            <mobileContext.Provider value={{ setSelectedTab }}>{components[selectedTab]}</mobileContext.Provider>
        </div>
    );
};

export default MobileHome;
