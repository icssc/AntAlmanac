import React, { PureComponent } from 'react';
import { Paper, TextField } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Autocomplete } from '@material-ui/lab';

import Building from '../../../RightPane/Map/static/building';
import buildingCatalogue from '../../../RightPane/Map/static/buildingCatalogue';
import locations from '../../../RightPane/SectionTable/static/locations.json';

interface LocationSelectorProps {
    handleSearch: (event: React.ChangeEvent<unknown>, value: Building | null) => void;
    previousOption: string | null;
    classes: ClassNameMap | null;
    defaultValue: any;
}

// I Keep this class as a location selector. 
// So whereever we want to add a location selector, we can use this class
// This is used by the MapMenu & CustomEventDialog
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
    };

    render() {
        return (
            <Paper elevation={0}>
                <Autocomplete
                    options={this.state.filteredItems}
                    getOptionLabel={(option) => option.name}
                    onChange={this.props.handleSearch}
                    renderInput={(params) => <TextField {...params} label="Search for a place" variant="filled" />}
                    defaultValue = {this.props.previousOption 
                                    ? this.fromBuildingNameToDetail(this.props.previousOption)
                                    : this.props.defaultValue}
                />
            </Paper>
        );
    }
}

export default LocationSelector;
