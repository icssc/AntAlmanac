import { AppBar, Toolbar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

import Import from './Import';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import { Logo } from './Logo';
import AppDrawer from './SettingsMenu';

import { AccountMenu } from '$components/Header/account/AccountMenu';

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
    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar variant="dense" style={{ padding: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <Logo />

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <LoadSaveScheduleFunctionality />
                    <Import key="studylist" />

                    <AccountMenu />

                    <AppDrawer key="settings" />
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(Header);
