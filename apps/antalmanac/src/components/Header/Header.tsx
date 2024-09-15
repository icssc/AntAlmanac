import { AppBar, Toolbar, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

import { BrandIntegration } from '../brandIntegrations/BrandIntegration';

import Import from './Import';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import Logo from './Logo';
import AppDrawer from './SettingsMenu';

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

const Header = ({ classes }: CustomAppBarProps) => {
    const isMobileScreen = useMediaQuery('(max-width:750px)');

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar variant="dense" style={{ padding: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: !isMobileScreen ? '14%' : '30%', height: '100%' }}>
                    <BrandIntegration isMobile={isMobileScreen} />
                </div>

                {!isMobileScreen ? <Logo /> : null}

                <div style={{ display: 'flex', flexDirection: 'row-reverse', width: !isMobileScreen ? '14%' : '65%' }}>
                    <AppDrawer key="settings" />
                    <Import key="studylist" />
                    <LoadSaveScheduleFunctionality />
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(Header);
