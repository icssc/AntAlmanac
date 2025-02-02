import { Box, TextField } from '@mui/material';
import { useCallback } from 'react';

import { ImportSource } from '$components/Header/import/Import';

interface ImportTabContentProps {
    value: string;
    setValue: (value: string) => void;
    importSource: ImportSource;
    children: React.ReactNode;
}

export function ImportTabContent({ value, setValue, importSource, children }: ImportTabContentProps) {
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.currentTarget.value);
    }, []);

    return (
        <Box>
            {children}

            <TextField
                fullWidth
                multiline
                margin="dense"
                type="text"
                placeholder={`Paste ${importSource} here`}
                label={importSource}
                value={value}
                onChange={handleChange}
            />
        </Box>
    );
}
