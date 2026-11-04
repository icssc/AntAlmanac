'use client';
import { Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Provider, useStore } from 'react-redux';

import './SharedRoadmap.scss';
import LoadingSpinner from '../../component/LoadingSpinner/LoadingSpinner';
import { expandPlanner } from '../../helpers/planner';
import { useValidatePlanner } from '../../hooks/planner';
import {
    initializeCompletedMarkers,
    initializeOverriddenRequirements,
    setSharedPrograms,
} from '../../store/slices/courseRequirementsSlice';
import {
    setInitialPlannerData,
    setReadOnly,
    setRoadmapLoading,
    updateRoadmapCustomCourse,
} from '../../store/slices/roadmapSlice';
import {
    setAllTransferredGEs,
    setAPExams,
    setDataLoadState,
    setSelectedApRewards,
    setTransferredCourses,
    setUncategorizedCourses,
    setUserAPExams,
} from '../../store/slices/transferCreditsSlice';
import { generateStore, RootState } from '../../store/store';
import trpc from '../../trpc';
import { RoadmapPlan } from '../../types/types';
import RoadmapPage from '../roadmap/RoadmapPage';

export type SharedRoadmapData = Awaited<ReturnType<typeof trpc.roadmaps.getSharedView.query>>;

/**
 * Creates a separate store holding only the shared roadmap and its owner's degree progress. Keeping it apart
 * from the viewer's store means nothing on the shared page can read or overwrite the viewer's own data.
 */
async function createSharedStore(data: SharedRoadmapData, viewerState: RootState) {
    const [yearPlans, apExams] = await Promise.all([
        expandPlanner(data.planner.content),
        trpc.transferCredits.getAPExamInfo.query(),
    ]);

    // The viewer's account and saved courses still apply to things like course previews and bookmarks
    const store = generateStore(viewerState.user, {
        savedCourses: viewerState.savedCourses,
        departments: viewerState.departments,
    });
    const { dispatch } = store;

    const plan: RoadmapPlan = {
        id: data.planner.id,
        name: data.planner.name,
        content: { yearPlans, invalidCourses: [] },
        chc: data.planner.chc,
    };
    dispatch(setReadOnly(true));
    dispatch(setInitialPlannerData({ plans: [plan], timestamp: Date.now() }));
    data.customCards.forEach((card) => {
        const course = { id: card.id, courseName: card.name, units: card.units, description: card.description };
        dispatch(updateRoadmapCustomCourse(course));
    });
    dispatch(setRoadmapLoading(false));

    dispatch(setSharedPrograms({ majors: data.majors, minors: data.minors }));
    dispatch(initializeCompletedMarkers(data.completedMarkers));
    dispatch(initializeOverriddenRequirements({ plannerId: plan.id, requirements: data.overriddenRequirements }));

    const parsedApExams = apExams.map((exam) => ({ ...exam, catalogueName: (exam.catalogueName as string) ?? null }));
    dispatch(setAPExams(parsedApExams));
    dispatch(setTransferredCourses(data.transfers.courses));
    dispatch(setUserAPExams(data.transfers.apExams));
    dispatch(setSelectedApRewards(data.transfers.selectedApRewards));
    dispatch(setAllTransferredGEs(data.transfers.ges));
    dispatch(setUncategorizedCourses(data.transfers.other));
    dispatch(setDataLoadState('done'));

    return store;
}

type SharedStore = Awaited<ReturnType<typeof createSharedStore>>;

const LoadError = () => (
    <div className="shared-roadmap-message">
        <Typography variant="h6" component="h1">
            Couldn&apos;t load this roadmap
        </Typography>
        <Typography variant="body2" color="textSecondary">
            Something went wrong on our end. Try refreshing the page.
        </Typography>
    </div>
);

/** Shows prerequisite warnings for the shared roadmap, since PlannerLoader only validates the viewer's own */
const SharedRoadmapValidator: FC = () => {
    useValidatePlanner();
    return null;
};

interface SharedRoadmapProps {
    /** The shared roadmap, or null if it could not be loaded */
    data: SharedRoadmapData | null;
}

const SharedRoadmap: FC<SharedRoadmapProps> = ({ data }) => {
    const viewerStore = useStore<RootState>();
    const [sharedStore, setSharedStore] = useState<SharedStore | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        if (!data) return;
        let cancelled = false;
        createSharedStore(data, viewerStore.getState())
            .then((store) => !cancelled && setSharedStore(store))
            .catch(() => !cancelled && setLoadFailed(true));
        return () => {
            cancelled = true;
        };
    }, [data, viewerStore]);

    if (!data || loadFailed) return <LoadError />;
    if (!sharedStore) return <LoadingSpinner />;

    return (
        <Provider store={sharedStore}>
            <SharedRoadmapValidator />
            <RoadmapPage />
        </Provider>
    );
};

export default SharedRoadmap;
