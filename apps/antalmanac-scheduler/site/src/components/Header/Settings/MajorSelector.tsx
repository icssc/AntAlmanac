import generatedMajors from '$generated/majors.json';
import { useSessionStore } from '$stores/SessionStore';
import { useUserInfoStore } from '$stores/UserInfoStore';
import { Edit } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { MajorSchoolDialog } from './MajorSchoolDialog';

const ALL_MAJORS: Record<string, string> = generatedMajors;

export function MajorSelector() {
    const sessionIsValid = useSessionStore((state) => state.sessionIsValid);
    const [majors, schools] = useUserInfoStore(useShallow((state) => [state.majors, state.schools]));
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);

    if (!sessionIsValid) {
        return null;
    }

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Major & School
                </Typography>
                <Button size="small" startIcon={<Edit />} onClick={handleOpen}>
                    {majors ? 'Edit' : 'Add'}
                </Button>
            </Stack>

            {majors && schools ? (
                <>
                    <Typography variant="body2">
                        {majors.map((major) => ALL_MAJORS[major] ?? major).join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {schools.join(', ')}
                    </Typography>
                </>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    Add your major to get enrollment restriction warnings.
                </Typography>
            )}

            {open && <MajorSchoolDialog open={open} onClose={handleClose} />}
        </Box>
    );
}
