import buildingCatalogue, { type Building } from '$lib/locations/buildingCatalogue';
import { Autocomplete, TextField, type TextFieldProps } from '@mui/material';
import { useCallback, useMemo } from 'react';

export interface ExtendedBuilding extends Building {
    id: string;
}

/**
 * Get unique building names for the MUI Autocomplete.
 * When multiple catalogue entries share a name, keep the first one encountered.
 */
const buildings: ExtendedBuilding[] = (() => {
    const byName = new Map<string, ExtendedBuilding>();

    for (const [id, building] of Object.entries(buildingCatalogue)) {
        if (!byName.has(building.name)) {
            byName.set(building.name, { id, ...building });
        }
    }

    return [...byName.values()];
})();

type BuildingSelectProps = {
    value?: string;
    onChange?: (building?: ExtendedBuilding | null) => unknown;
    variant?: TextFieldProps['variant'];
};

export function BuildingSelect(props: BuildingSelectProps) {
    const { onChange, variant = 'standard' } = props;
    const handleChange = useCallback(
        async (_event: React.SyntheticEvent, value: ExtendedBuilding | null) => {
            await onChange?.(value);
        },
        [onChange]
    );

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
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search for a place"
                    variant={variant}
                    InputLabelProps={{ variant: variant }}
                    color="secondary"
                />
            )}
        />
    );
}
