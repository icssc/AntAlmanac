import React, { Fragment, PureComponent } from 'react';
import { Tab, Tabs, Paper, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import buildingCatalogue from './static/buildingCatalogue';
import PropTypes from 'prop-types';
import { Autocomplete } from '@material-ui/lab';
import { styled } from '@material-ui/core/styles';

const styles = {
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

class MapTabsAndSearchBar extends PureComponent {
    state = {
        filteredItems: Object.values(buildingCatalogue),
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Paper elevation={0} className={classes.tabContainer}>
                    <StyledTabs
                        value={this.props.day}
                        onChange={(event, newDay) => {
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
            </Fragment>
        );
    }
}

MapTabsAndSearchBar.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    setDay: PropTypes.func.isRequired,
    day: PropTypes.number.isRequired,
};

export default withStyles(styles)(MapTabsAndSearchBar);
