import generatedMajors from '$generated/majors.json';
import { useUserInfoStore } from '$stores/UserInfoStore';
import { Autocomplete, TextField } from '@mui/material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import type { School } from '@packages/antalmanac-types';
import { SchoolSchema } from '@packages/antalmanac-types';
import { MAJOR_SCHOOLS_MAP } from '@packages/antalmanac-types';
import { memo, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface MajorSchoolDialogProps {
    open: boolean;
    onClose: () => void;
}

const ALL_MAJORS: Record<string, string> = generatedMajors;

interface MajorFieldProps {
    value: string | null;
    onChange: (major: string | null) => void;
}

const MajorField = memo(({ value, onChange }: MajorFieldProps) => {
    const options = Object.keys(ALL_MAJORS);

    const handleChange = useCallback(
        (_: unknown, option: string | null) => {
            onChange(option);
        },
        [onChange]
    );

    return (
        <Autocomplete
            value={value && value in ALL_MAJORS ? value : null}
            options={options}
            autoHighlight
            openOnFocus
            getOptionLabel={(option) => ALL_MAJORS[option] ?? option}
            onChange={handleChange}
            includeInputInList
            noOptionsText="No majors match the search"
            renderInput={(params) => <TextField {...params} fullWidth size="small" placeholder="Select your major" />}
        />
    );
});

MajorField.displayName = 'MajorField';

interface SchoolFieldProps {
    value: School[];
    onChange: (schools: School[]) => void;
}

const SchoolField = memo(({ value, onChange }: SchoolFieldProps) => {
    const options = SchoolSchema.options;

    const handleChange = useCallback(
        (_: unknown, options: School[]) => {
            onChange(options);
        },
        [onChange]
    );

    return (
        <Autocomplete
            multiple
            value={value}
            options={options}
            autoHighlight
            openOnFocus
            onChange={handleChange}
            includeInputInList
            noOptionsText="No schools match the search"
            renderInput={(params) => <TextField {...params} fullWidth size="small" placeholder="School" />}
        />
    );
});

SchoolField.displayName = 'SchoolField';

export function MajorSchoolDialog({ open, onClose }: MajorSchoolDialogProps) {
    const [savedMajor, savedSchools, setMajorSchools] = useUserInfoStore(
        useShallow((state) => [state.major, state.schools, state.setMajorSchools])
    );

    const [major, setMajor] = useState<string | null>(savedMajor);
    const [schools, setSchools] = useState<School[]>(savedSchools);

    const handleMajorChange = useCallback((newMajor: string | null) => {
        setMajor(newMajor);
        const majorSchools = newMajor ? MAJOR_SCHOOLS_MAP[newMajor] : undefined;
        if (majorSchools) {
            setSchools([...majorSchools]);
        }
    }, []);

    const handleSave = useCallback(() => {
        if (major && schools) {
            void setMajorSchools(major, schools);
            onClose();
        }
    }, [major, schools, setMajorSchools, onClose]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { borderRadius: 2 } } }}
        >
            <DialogTitle sx={{ fontWeight: 600, fontSize: '1.75rem' }}>Major & School</DialogTitle>
            <DialogContent>
                <Stack sx={{ gap: 2, pt: 1 }}>
                    <DialogContentText>
                        Used to warn you when a section may be restricted. Check Webreg to be sure.
                    </DialogContentText>
                    <MajorField value={major} onChange={handleMajorChange} />
                    <SchoolField value={schools} onChange={setSchools} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" disabled={!major || schools.length === 0}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
