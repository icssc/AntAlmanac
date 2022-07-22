import React, {MouseEventHandler, ReactElement} from 'react';
import { AppBar, Toolbar, Menu, useMediaQuery } from '@material-ui/core';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import NotificationHub from './NotificationHub';
import SettingsMenu from './SettingsMenu';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './mobile-logo.svg';
import News from './News';
import AboutPage from './AboutPage';
import ConditionalWrapper from '../ConditionalWrapper';
import ImportStudyList from './ImportStudyList';
import Feedback from './Feedback';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';


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
};

interface CustomAppBarProps {
    classes: ClassNameMap
}

const CustomAppBar = ({classes}: CustomAppBarProps) => {

    const isMobileScreen = useMediaQuery('(max-width:750px)');

    const [anchorEl, setAnchorEl] = React.useState<Element|null>(null);

    const handleClick: MouseEventHandler<SVGSVGElement> = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar variant="dense">
                {isMobileScreen ? <MobileLogo height={32} /> : <Logo height={32} />}

                <div style={{ flexGrow: '1' }} />

                <LoadSaveScheduleFunctionality />

                <ConditionalWrapper
                    condition={isMobileScreen}
                    wrapper={(children) => (
                        <div>
                            <MenuIcon onClick={handleClick} />
                            <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                                {children}
                            </Menu>
                        </div>
                    )}
                >
                    {/* @ts-ignore It thinks that this list is Element[], not ReactElement[], despite all of these extending PureComponent*/}
                    {
                    [
                        <SettingsMenu />,
                        <NotificationHub />,
                        <ImportStudyList />,
                        <Feedback />,
                        <News />,
                        <AboutPage />
                    ].map((element, index) => (
                        {element}
                    ))}
                </ConditionalWrapper>
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(CustomAppBar);
