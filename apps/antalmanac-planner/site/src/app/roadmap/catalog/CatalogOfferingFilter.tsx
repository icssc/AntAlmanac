import { Alert, Box, MenuItem, TextField } from '@mui/material';
import type { ProgramRequirement } from '@peterportal/types';
import { createContext, ReactNode, useContext, useState } from 'react';

import { OfferingQuarter, OfferingStatus } from '../../../helpers/courseOfferings';
import { useCatalogOfferings } from '../../../hooks/catalogOfferings';

const OfferingFilterContext = createContext<Record<string, OfferingStatus>>({});

export function useCatalogOfferingStatus(courseId: string) {
    return useContext(OfferingFilterContext)[courseId];
}

interface OfferingFilterProps {
    requirements: ProgramRequirement[];
    children: ReactNode;
}

export default function CatalogOfferingFilter({ requirements, children }: OfferingFilterProps) {
    const [quarter, setQuarter] = useState<OfferingQuarter | 'all'>('all');
    const selectedQuarter = quarter === 'all' ? null : quarter;
    const { statuses, error } = useCatalogOfferings(requirements, selectedQuarter);

    return (
        <OfferingFilterContext.Provider value={statuses}>
            <Box sx={{ my: 2 }}>
                <TextField
                    select
                    fullWidth
                    size="small"
                    label="Previous Offerings"
                    value={quarter}
                    onChange={(event) => setQuarter(event.target.value as OfferingQuarter | 'all')}
                >
                    <MenuItem value="all">All Quarters</MenuItem>
                    {(['Fall', 'Winter', 'Spring', 'Summer'] as const).map((quarter) => (
                        <MenuItem key={quarter} value={quarter}>
                            {quarter}
                        </MenuItem>
                    ))}
                </TextField>
                {selectedQuarter && Boolean(error) && <Alert severity="error">Could not load offering history.</Alert>}
            </Box>
            {children}
        </OfferingFilterContext.Provider>
    );
}
