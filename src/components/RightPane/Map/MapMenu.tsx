import { Autocomplete, Paper, Tab, Tabs, TextField, Theme } from '@mui/material';
import { styled, withStyles } from '@mui/styles';
import { ClassNameMap, Styles } from '@mui/styles/withStyles';
import React, { PureComponent } from 'react';

import Building from './static/building';
import buildingCatalogue from './static/buildingCatalogue';

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
    classes: ClassNameMap;
    day: number;
    setDay: (newDay: number) => void;
    handleSearch: (event: React.ChangeEvent<unknown>, value: Building | null) => void;
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

                <Paper elevation={0} className={classes.searchBarContainer}>
                    <Autocomplete
                        options={this.state.filteredItems}
                        getOptionLabel={(option) => option.name}
                        onChange={this.props.handleSearch}
                        renderInput={(params) => <TextField {...params} label="Search for a place" variant="filled" />}
                    />
                </Paper>
            </>
        );
    }
}

/**Includes the tabs for days of the week, and the search bar */
export default withStyles(styles)(MapMenu);
