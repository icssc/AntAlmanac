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
    const [major, schools] = useUserInfoStore(useShallow((state) => [state.major, state.schools]));
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
                    {major ? 'Edit' : 'Add'}
                </Button>
            </Stack>

            {major && schools ? (
                <>
                    <Typography variant="body2">{ALL_MAJORS[major] ?? major}</Typography>
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
