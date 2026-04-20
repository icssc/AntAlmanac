// import { usePlannerRoadmaps } from '$hooks/usePlanner';
import { useSessionStore } from '$stores/SessionStore';
import { Box, Button, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { MouseEvent, useState } from 'react';

const SearchWithPlannerButton = () => {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const sessionIsValid = useSessionStore((state) => state.sessionIsValid);

    // const { roadmaps } = usePlannerRoadmaps();
    // TODO
    const roadmaps = [
        {
            id: 1,
            name: 'hi',
        },
        {
            id: 2,
            name: 'aaaaa',
        },
    ];

    const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    const handleMenuClose = () => {
        setOpen(false);
    };

    const search = (roadmapId: Roadmap['id']) => {
        console.log('searching', roadmapId);
        handleMenuClose();
    };

    return (
        <>
            <Tooltip
                title={
                    sessionIsValid
                        ? "Search for the classes in one of your roadmap's quarters"
                        : 'Sign in to search with planner'
                }
            >
                <span style={{ width: '50%', minWidth: '300px' }}>
                    <Button
                        onClick={handleMenuOpen}
                        disabled={!sessionIsValid}
                        variant="contained"
                        sx={{ width: '100%' }}
                    >
                        Search with Planner roadmap
                    </Button>
                </span>
            </Tooltip>

            <Menu open={open} onClose={handleMenuClose} anchorEl={anchorEl}>
                <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                    {roadmaps.length === 0 ? (
                        <Typography sx={{ padding: 1 }}>You currently don't have any Planner roadmaps.</Typography>
                    ) : (
                        roadmaps.map((roadmap) => {
                            return (
                                <MenuItem key={roadmap.id} onClick={() => search(roadmap.id)}>
                                    {roadmap.name}
                                </MenuItem>
                            );
                        })
                    )}
                </Box>
            </Menu>
        </>
    );
};
export default SearchWithPlannerButton;
