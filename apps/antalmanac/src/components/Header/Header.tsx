import { AppBar, Toolbar, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

import AccountButton from './AccountButton';
import Import from './Import';
import LoadButton from './LoadButton';
import LoginButton from './LoginButton';
import SaveButton from './SaveButton';
import AppDrawer from './SettingsMenu';

import Logo from '$assets/logo.svg';
import MobileLogo from '$assets/mobile-logo.svg';
import { trpc } from '$lib/trpc';

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

    const authStatus = trpc.auth.status.useQuery();

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar variant="dense" style={{ padding: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <img
                    height={32}
                    src={isMobileScreen ? MobileLogo : Logo}
                    title={'Thanks Aejin for designing this seasonal logo!'}
                    alt="logo"
                />

                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <SaveButton />

                    <LoadButton />

                    <Import key="studylist" />

                    {authStatus.data ? <AccountButton /> : <LoginButton />}

                    <AppDrawer key="settings" />
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(Header);
