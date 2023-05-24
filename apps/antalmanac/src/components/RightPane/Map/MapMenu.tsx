import { Box, Paper, Tab, Tabs, TextField } from '@material-ui/core';
import { styled, Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Autocomplete } from '@material-ui/lab';
import React, { PureComponent } from 'react';

import Building from './static/building';
import buildingCatalogue from './static/buildingCatalogue';
import AppStore from '$stores/AppStore';

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
    showFinalsSchedule: boolean;
    setDay: (newDay: number) => void;
    handleSearch: (event: React.ChangeEvent<unknown>, value: Building | null) => void;
}

class MapMenu extends PureComponent<MapMenuProps> {
    state = {
        filteredItems: Object.values(buildingCatalogue),
    };

    render() {
        const { classes } = this.props;

        const events = AppStore.getEventsInCalendar();
        const hasWeekendCourse = events.some((event) => event.start.getDay() === 0 || event.start.getDay() === 6);

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
                        {hasWeekendCourse ? <StyledTab label="Sun" /> : null}
                        <StyledTab label="Mon" />
                        <StyledTab label="Tue" />
                        <StyledTab label="Wed" />
                        <StyledTab label="Thu" />
                        <StyledTab label="Fri" />
                        {hasWeekendCourse ? <StyledTab label="Sat" /> : null}
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
