import { SignInDialog } from '$components/dialogs/SignInDialog';
import { CreateRoadmapLinkItem } from '$components/RightPane/CoursePane/SearchForm/CreateRoadmapLinkItem';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box, MenuItem, Tooltip, Typography } from '@mui/material';
import type { Roadmap } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type RoadmapMenuItemsProps = {
    isLoggedIn: boolean;
    roadmaps: Roadmap[];
};

function getRoadmapMenuItems({ isLoggedIn, roadmaps }: RoadmapMenuItemsProps) {
    if (!isLoggedIn) {
        return [
            <MenuItem key="signin" value="">
                Sign In to filter
            </MenuItem>,
        ];
    }

    if (roadmaps.length === 0) {
        return <CreateRoadmapLinkItem verticalPadding={'6px'} value="" />;
    }

    return [
        <MenuItem key="all" value="">
            {' '}
            Include all courses
        </MenuItem>,
        ...roadmaps.map((roadmap) => (
            <MenuItem key={roadmap.id} value={roadmap.id.toString()}>
                {roadmap.name}
            </MenuItem>
        )),
    ];
}

export const ExcludeRoadmapField = memo(() => {
    const [excludeRoadmapCourses, setExcludeRoadmapCourses] = useCourseSearchParam('excludeRoadmapCourses');
    const { plannerRoadmaps, loadPlannerRoadmaps, updateTakenCourses } = usePlannerStore(
        useShallow((s) => ({
            plannerRoadmaps: s.plannerRoadmaps,
            loadPlannerRoadmaps: s.loadPlannerRoadmaps,
            updateTakenCourses: s.updateTakenCourses,
        }))
    );
    const sessionIsValid = useSessionStore((s) => s.sessionIsValid);
    const [signInOpen, setSignInOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSignInClose = useCallback(() => {
        setSignInOpen(false);
    }, []);

    const handleMenuOpen = useCallback(() => {
        if (!sessionIsValid) {
            setSignInOpen(true);
            return;
        }

        setMenuOpen(true);
        if (plannerRoadmaps.length === 0) {
            void loadPlannerRoadmaps();
        }
    }, [loadPlannerRoadmaps, plannerRoadmaps.length, sessionIsValid]);

    const handleMenuClose = useCallback(() => {
        setMenuOpen(false);
    }, []);

    useEffect(() => {
        updateTakenCourses(excludeRoadmapCourses);

        if (!excludeRoadmapCourses) return;
        if (!plannerRoadmaps || plannerRoadmaps.length === 0) return;

        const exists = plannerRoadmaps.some((r) => r.id.toString() === excludeRoadmapCourses);

        if (!exists) {
            openSnackbar('warning', 'Invalid roadmap selection. All courses shown.');
            setExcludeRoadmapCourses('');
        }
    }, [excludeRoadmapCourses, plannerRoadmaps, setExcludeRoadmapCourses, updateTakenCourses]);

    return (
        <>
            <LabeledSelect
                label={
                    <Tooltip
                        title={<Typography sx={{ fontSize: '0.8rem' }}>Data from AntAlmanac.com/planner</Typography>}
                    >
                        <Box>Exclude Taken Courses</Box>
                    </Tooltip>
                }
                selectProps={{
                    value: excludeRoadmapCourses,
                    onChange: (event) => setExcludeRoadmapCourses(event.target.value),
                    displayEmpty: true,
                    sx: { width: '100%' },
                    open: menuOpen,
                    onOpen: handleMenuOpen,
                    onClose: handleMenuClose,
                }}
            >
                {getRoadmapMenuItems({ isLoggedIn: sessionIsValid, roadmaps: plannerRoadmaps })}
            </LabeledSelect>
            <SignInDialog open={signInOpen} onClose={handleSignInClose} feature="Planner" />
        </>
    );
});

ExcludeRoadmapField.displayName = 'ExcludeRoadmapField';
