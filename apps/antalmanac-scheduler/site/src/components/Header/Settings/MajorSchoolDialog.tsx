import generatedMajors from '$generated/majors.json';
import { useUserInfoStore } from '$stores/UserInfoStore';
import { Autocomplete, TextField } from '@mui/material';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import { getSchoolsFromMajors } from '@packages/antalmanac-types';
import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

const MAX_MAJORS = 3;
const ALL_MAJORS: Record<string, string> = generatedMajors;

interface MajorSchoolDialogProps {
    open: boolean;
    onClose: () => void;
}

interface MajorFieldProps {
    value: string[];
    onChange: (major: string[]) => void;
}

const MajorField = memo(({ value, onChange }: MajorFieldProps) => {
    const options = Object.keys(ALL_MAJORS);

    const handleChange = useCallback(
        (_: unknown, option: string[]) => {
            onChange(option);
        },
        [onChange]
    );

    return (
        <Autocomplete
            multiple
            sx={{ '& .MuiChip-label': { fontSize: '1rem' } }}
            value={value}
            options={options}
            getOptionDisabled={(option) => value.length >= MAX_MAJORS && !value.includes(option)}
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

export function MajorSchoolDialog({ open, onClose }: MajorSchoolDialogProps) {
    const [savedMajors, setMajors] = useUserInfoStore(useShallow((state) => [state.majors, state.setMajors]));

    const [selectedMajors, setSelectedMajors] = useState<string[]>(savedMajors);
    const schools = useMemo(() => getSchoolsFromMajors(selectedMajors), [selectedMajors]);

    const handleSave = useCallback(() => {
        if (selectedMajors.length === 0) return;
        void setMajors(selectedMajors);
        onClose();
    }, [selectedMajors, setMajors, onClose]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { borderRadius: 2 } } }}
        >
            <DialogTitle sx={{ fontWeight: 600, fontSize: '1.75rem' }}>Major</DialogTitle>
            <DialogContent>
                <Stack sx={{ gap: 2, pt: 1 }}>
                    <DialogContentText>
                        Used to warn you when a section may be restricted. Check Webreg to be sure.
                    </DialogContentText>
                    <MajorField value={selectedMajors} onChange={setSelectedMajors} />
                    {schools.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {schools.join(', ')}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" disabled={selectedMajors.length === 0}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
