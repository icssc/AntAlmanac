import { Paper, Tab, Tabs } from '@material-ui/core';
import { styled, Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import React, { PureComponent } from 'react';

import Building from './static/building';
import buildingCatalogue from './static/buildingCatalogue';
import LocationSelector from '../../Calendar/Toolbar/CustomEventDialog/LocationSelector';

const styles: Styles<Theme, object> = {
    tabContainer: {
        zIndex: 1000,
        marginLeft: '15%',
        marginRight: '15%',
        marginTop: '8px',
        marginBottom: '8px',
        position: 'relative',
    },
    searchBarContainer: {
        minWidth: '60%',
        position: 'relative',
        marginLeft: '15%',
        marginRight: '15%',
        zIndex: 1000,
        alignItems: 'center',
    },
};

const StyledTabs = styled(Tabs)({
    minHeight: 0,
});

const StyledTab = styled(Tab)({
    minHeight: 'auto',
    minWidth: '10%',
    padding: 0,
});

interface MapMenuProps {
    day: number;
    setDay: (newDay: number) => void;
    classes: ClassNameMap;
    handleSearch: (event: React.ChangeEvent<unknown>, value: Building | null) => void;
    defaultValue: any;
}

class MapMenu extends PureComponent<MapMenuProps> {
    state = {
        filteredItems: Object.values(buildingCatalogue),
    };

    render() {
        const { classes } = this.props;

        return (
            <>
                <Paper elevation={0} className={classes.tabContainer}>
                    <StyledTabs
                        value={this.props.day}
                        onChange={(event, newDay: number) => {
                            this.props.setDay(newDay);
                        }}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        scrollButtons="auto"
                        centered
                    >
                        <StyledTab label="All" />
                        <StyledTab label="Mon" />
                        <StyledTab label="Tue" />
                        <StyledTab label="Wed" />
                        <StyledTab label="Thu" />
                        <StyledTab label="Fri" />
                    </StyledTabs>
                </Paper>
                <Paper elevation={0} className={classes.tabContainer}>
                    <LocationSelector
                        handleSearch={this.props.handleSearch}
                        defaultValue = {this.props.defaultValue}
                        classes={this.props.classes}
                        previousOption = {null}
                    />
                </Paper>
            </>
        );
    }
}

/**Includes the tabs for days of the week, and the search bar */
export default withStyles(styles)(MapMenu);
