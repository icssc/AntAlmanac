import { AppBar, Toolbar, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

import Export from './Export';
import Import from './Import';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import AppDrawer from './SettingsMenu';

import ChristmasLogo from '$assets/christmas-logo.png';
import MobileChristmasLogo from '$assets/christmas-mobile-logo.png';
import DefaultLogo from '$assets/logo.svg';
import MobileDefaultLogo from '$assets/mobile-logo.svg';
//import ThanksgivingLogo from '$assets/thanksgiving-logo.png';
//import MobileThanksgivingLogo from '$assets/thanksgiving-mobile-logo.png';
//import HalloweenLogo from '$assets/halloween-logo.png';
//import MobileHalloweenLogo from '$assets/halloween-mobile-logo.png';

const styles = {
    appBar: {
        marginBottom: '4px',
        boxShadow: 'none',
        minHeight: 0,
        height: '50px',
    },
    buttonMargin: {
        marginRight: '4px',
    },
    fallback: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIconContainer: {
        padding: '0.25rem',
        display: 'flex',
    },
};

interface CustomAppBarProps {
    classes: ClassNameMap;
}

/*
interface LogoBounds {
    startDay: number; // inclusive
    startMonth: number;
    endDay: number; // exclusive
    endMonth: number;
}
*/

const withinBounds = (): boolean => {
    //(bounds: LogoBounds): boolean => {
    //const { startDay, startMonth, endDay, endMonth } = bounds;
    //const currentDate = new Date();
    //const currentMonth = currentDate.getMonth();
    //const currentDay = currentDate.getDate();

    // compare dates
    return true; // not implemented obviously
};

//const Christmas: LogoBounds = { startDay: 1, startMonth: 11, endDay: 1, endMonth: 1 };
// ...

const getLogo = (isMobileScreen: boolean): string => {
    if (withinBounds()) {
        //Christmas)) {
        return isMobileScreen ? MobileChristmasLogo : ChristmasLogo;
    }
    // ...
    else {
        return isMobileScreen ? MobileDefaultLogo : DefaultLogo;
    }
};

const Header = ({ classes }: CustomAppBarProps) => {
    const isMobileScreen = useMediaQuery('(max-width:750px)');

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar variant="dense" style={{ padding: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <img
                    height={32}
                    src={getLogo(isMobileScreen)}
                    title={'Thanks Aejin for designing this seasonal logo!'}
                    alt="logo"
                />

                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <LoadSaveScheduleFunctionality />

                    {isMobileScreen ? null : (
                        <>
                            <Import key="studylist" />
                            <Export key="export" />
                        </>
                    )}

                    <AppDrawer key="settings" />
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(Header);
