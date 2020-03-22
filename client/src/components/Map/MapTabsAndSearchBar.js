import React, { Fragment, PureComponent } from 'react';
import { Tab, Tabs } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import buildingCatalogue from './buildingCatalogue';
import PropTypes from 'prop-types';
import { Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';

const styles = {
    tabContainer: {
        zIndex: 1000,
        marginLeft: 45,
        marginRight: 45,
        marginTop: 11,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    tab: {
        minWidth: '10%',
        backgroundColor: '#FFFFFF',
    },
    searchBarContainer: {
        minWidth: '60%',
        position: 'relative',
        marginLeft: '15%',
        marginRight: '15%',
        marginTop: 5,
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
    },
};

class MapTabsAndSearchBar extends PureComponent {
    state = {
        filteredItems: buildingCatalogue,
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <div className={classes.tabContainer}>
                    <Tabs
                        value={this.props.day}
                        onChange={(event, newDay) => {
                            this.props.setDay(newDay);
                        }}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="standard"
                        scrollButtons="auto"
                        centered
                    >
                        <Tab label="All" className={classes.tab} />
                        <Tab label="Mon" className={classes.tab} />
                        <Tab label="Tue" className={classes.tab} />
                        <Tab label="Wed" className={classes.tab} />
                        <Tab label="Thu" className={classes.tab} />
                        <Tab label="Fri" className={classes.tab} />
                    </Tabs>
                </div>

                <div className={classes.searchBarContainer}>
                    <Autocomplete
                        options={this.state.filteredItems}
                        getOptionLabel={(option) => option.label}
                        onChange={this.props.handleSearch}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search for a place"
                                variant="filled"
                            />
                        )}
                    />

                    {/*<MuiDownshift*/}
                    {/*    items={this.state.filteredItems}*/}
                    {/*    onStateChange={this.filterLocations}*/}
                    {/*    getInputProps={() => ({*/}
                    {/*        variant: 'filled',*/}
                    {/*        label: 'Search for a place',*/}
                    {/*    })}*/}
                    {/*    onChange={this.props.handleSearch}*/}
                    {/*    menuItemCount={window.innerWidth > 960 ? 6 : 3}*/}
                    {/*/>*/}
                </div>
            </Fragment>
        );
    }
}

MapTabsAndSearchBar.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    setDay: PropTypes.func.isRequired,
    day: PropTypes.string.isRequired,
};

export default withStyles(styles)(MapTabsAndSearchBar);
