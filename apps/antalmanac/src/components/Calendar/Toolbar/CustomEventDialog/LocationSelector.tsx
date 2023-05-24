import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import React, { PureComponent } from 'react';
import { Paper, Tab, Tabs, TextField } from '@material-ui/core';
import { styled, Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Autocomplete } from '@material-ui/lab';

import Building from '../../../RightPane/Map/static/building';
import buildingCatalogue from '../../../RightPane/Map/static/buildingCatalogue';
import locations from '../../../RightPane/SectionTable/static/locations.json';

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


interface LocationSelectorProps {
    handleSearch: (event: React.ChangeEvent<unknown>, value: Building | null) => void;
    previousOption: string;
}

class LocationSelector extends PureComponent<LocationSelectorProps>  {
    state = {
        filteredItems: Object.values(buildingCatalogue),
    };

    fromBuildingNameToDetail(name: string){
        if (name.includes("(")){
            const buildingCode = name.split('(')[1].slice(0, -1) as keyof typeof locations;
            const id = locations[buildingCode] as keyof typeof buildingCatalogue;
            const locationData = buildingCatalogue[id];
            return locationData;
        } else {
            const values = Object.values(buildingCatalogue);
            var result = null;
            values.forEach((value) => {
                if (name == value.name){
                    result = value;
                }
            });
            return result;
        }
    }

    render() {
        return (
            <Paper elevation={0}>
                <Autocomplete
                    options={this.state.filteredItems}
                    getOptionLabel={((option) => option.name)}
                    defaultValue={this.props.previousOption 
                        ? this.fromBuildingNameToDetail(this.props.previousOption)
                        : null}
                    onChange={this.props.handleSearch}
                    renderInput={(params) => <TextField {...params} label="Search for a place" variant="filled" />}
                />
            </Paper>
        );
    }
}

export default withStyles(styles)(LocationSelector);