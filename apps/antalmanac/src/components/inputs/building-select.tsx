import { useCallback, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import buildingCatalogue, { Building } from '$lib/buildingCatalogue';

export interface ExtendedBuilding extends Building {
    id: string;
}

/**
 * Get unique building names for the MUI Autocomplete.
 * A building with a duplicate name will have a higher index then a `findIndex` for another building with the same name.
 */
const buildings: ExtendedBuilding[] = Object.entries(buildingCatalogue)
    .filter(
        ([_, building], index, array) =>
            array.findIndex(([_, otherBuilding]) => otherBuilding.name === building.name) === index
    )
    .map(([id, building]) => ({ id, ...building }));

export type BuildingSelectProps = {
    value?: string;
    onChange?: (building?: ExtendedBuilding | null) => unknown;
};

export function BuildingSelect(props: BuildingSelectProps) {
    const handleChange = useCallback(async (_event: React.SyntheticEvent, value: ExtendedBuilding | null) => {
        await props.onChange?.(value);
    }, []);

    const value = useMemo(() => {
        if (props.value == null) {
            return;
        }

        const building = buildingCatalogue[Number(props.value)];

        return {
            id: props.value,
            ...building,
        };
    }, [props.value]);

    return (
        <Autocomplete
            options={buildings}
            value={value}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            getOptionLabel={(option) => option.name ?? ''}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} label="Search for a place" variant="filled" />}
        />
    );
}
