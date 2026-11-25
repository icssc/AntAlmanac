'use client';
import { SavedPlannerData, SavedRoadmap } from '@peterportal/types';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
    collapseAllPlanners,
    expandAllPlanners,
    prefetchPlannerCourses,
    loadRoadmap,
    readLocalRoadmap,
    saveRoadmap,
    validatePlanner,
} from '../../../helpers/planner';
import { compareRoadmaps, restoreRevision } from '../../../helpers/roadmap';
import { readRoadmapSnapshot, writeRoadmapSnapshot } from '../../../helpers/roadmapSnapshot';
import {
    getNamesOfTransfers,
    loadTransferredAPs,
    loadTransferredCourses,
    loadTransferredGEs,
    loadTransferredOther,
} from '../../../helpers/transferCredits';
import { deepCopy } from '../../../helpers/util';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';
import { useTransferredCredits } from '../../../hooks/transferCredits';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setCustomCourses } from '../../../store/slices/customCourseSlice';
import {
    selectCurrentPlan,
    selectYearPlans,
    setInitialPlannerData,
    setInvalidCourses,
    setRoadmapLoading,
    setSnapshotPending,
    setToastMsg,
    setToastSeverity,
    setShowToast,
    updateRoadmapCustomCourse,
    updateTempPlannerIds,
} from '../../../store/slices/roadmapSlice';
import { setDataLoadState } from '../../../store/slices/transferCreditsSlice';
import trpc from '../../../trpc';
import PlannerLoaderModal from './PlannerLoaderModal';

function useCheckUnsavedChanges() {
    const currentIndex = useAppSelector((state) => state.roadmap.currentRevisionIndex);
    const lastSavedIndex = useAppSelector((state) => state.roadmap.savedRevisionIndex);

    const planners = useAppSelector((state) => state.roadmap.plans);
    const revisions = useAppSelector((state) => state.roadmap.revisions);
    const currIdx = useAppSelector((state) => state.roadmap.currentRevisionIndex);
    const lastSaveIdx = useAppSelector((state) => state.roadmap.savedRevisionIndex);

    useEffect(() => {
        if (currentIndex === lastSavedIndex) return;
        const alertIfUnsaved = (event: BeforeUnloadEvent) => {
            const lastSavedRoadmapPlans = deepCopy(planners);
            restoreRevision(lastSavedRoadmapPlans, revisions, currIdx, lastSaveIdx);
            const collapsedPrevious = collapseAllPlanners(lastSavedRoadmapPlans);
            const collapsedCurrent = collapseAllPlanners(planners);
            const diffs = compareRoadmaps(collapsedPrevious, collapsedCurrent);

            const isDifferent = Object.values(diffs).some((val) => Array.isArray(val) && val.length > 0);
            if (isDifferent) event.preventDefault();
        };
        window.addEventListener('beforeunload', alertIfUnsaved);
        return () => window.removeEventListener('beforeunload', alertIfUnsaved);
    });
}

const PlannerLoader: FC = () => {
    const [showSyncModal, setShowSyncModal] = useState(false);
    const userTransfersLoaded = useAppSelector((state) => state.transferCredits.dataLoadState === 'done');
    const transferred = useTransferredCredits();
    const currentPlanData = useAppSelector(selectYearPlans);
    const isCHC = Boolean(useAppSelector(selectCurrentPlan)?.chc);
    const isRoadmapLoading = useAppSelector((state) => state.roadmap.roadmapLoading);
    const isLoggedIn = useIsLoggedIn();
    const userKey = useAppSelector((state) => state.user.user?.email);
    useCheckUnsavedChanges();

    const serverRoadmapReceived = useRef(false);
    // The roadmap painted from the snapshot, until the server copy has been reconciled with it
    const paintedSnapshot = useRef<SavedRoadmap | null>(null);
    const [roadmapLoaded, setRoadmapLoaded] = useState(false);
    const [initialLocalRoadmap, setInitialLocalRoadmap] = useState<SavedRoadmap | null>(null);
    const [initialAccountRoadmap, setInitialAccountRoadmap] = useState<SavedRoadmap | null>(null);

    const dispatch = useAppDispatch();

    const getPlanIndexFromQuery = useCallback((plans: { id: number }[]): number | undefined => {
        if (typeof window === 'undefined') return undefined;
        const planParam = new URLSearchParams(window.location.search).get('plan');
        if (!planParam) return undefined;
        const planId = Number(planParam);
        if (!Number.isFinite(planId)) return undefined;
        const planIndex = plans.findIndex((plan) => plan.id === planId);
        return planIndex >= 0 ? planIndex : undefined;
    }, []);

    const loadLocalTransfers = async () => {
        const courses = await loadTransferredCourses(false);
        const ap = await loadTransferredAPs(false);
        const ge = await loadTransferredGEs(false);
        const other = await loadTransferredOther(false);
        return { courses, ap, ge, other };
    };

    // Defaults to account if it exists because local can override it in a different helper
    const populateExistingRoadmap = useCallback(
        async (roadmap: SavedRoadmap) => {
            const plans = await expandAllPlanners(roadmap.planners);
            const snapshot = paintedSnapshot.current;
            paintedSnapshot.current = null;
            const snapshotAccurate =
                !!snapshot &&
                JSON.stringify(snapshot.planners) === JSON.stringify(roadmap.planners) &&
                snapshot.currentPlanIndex === roadmap.currentPlanIndex;
            if (snapshotAccurate) {
                // The roadmap on screen is already the server's; just unlock it (the snapshot was read-only)
                dispatch(setSnapshotPending(false));
                dispatch(setRoadmapLoading(false));
                return;
            }
            const timestamp = new Date(roadmap.timestamp ?? Date.now()).getTime();
            dispatch(
                setInitialPlannerData({
                    plans,
                    timestamp,
                    currentPlanIndex: getPlanIndexFromQuery(plans) ?? roadmap.currentPlanIndex ?? 0,
                })
            );
            dispatch(setSnapshotPending(false));
            dispatch(setRoadmapLoading(false));
        },
        [dispatch, getPlanIndexFromQuery]
    );

    // save function will update localStorage (thus comparisons above will work) and account roadmap
    const saveRoadmapAndUpsertTransfers = useCallback(
        async (
            collapsedLocalPlans: SavedPlannerData[],
            collapsedAccountPlans: SavedPlannerData[] | null,
            currentPlanIndex?: number
        ) => {
            // Cannot be called before format is upgraded from single to multi-planner
            const result = await saveRoadmap(isLoggedIn, collapsedAccountPlans, collapsedLocalPlans, currentPlanIndex);

            if (result.success && isLoggedIn) {
                dispatch(setToastMsg('Roadmap saved to your account!'));
                dispatch(setToastSeverity('success'));
                dispatch(setShowToast(true));
            } else if (result.success && !isLoggedIn) {
                setToastMsg('Roadmap saved locally! Log in to save it to your account');
                dispatch(setToastSeverity('success'));
                dispatch(setShowToast(true));
            } else if (!result.success) {
                setToastMsg('Unable to save roadmap to your account');
                setToastSeverity('error');
                setShowToast(true);
            }

            if (result.success && result.plannerIdLookup) {
                dispatch(updateTempPlannerIds(result.plannerIdLookup));
            }

            // upsert transfers
            const { courses, ap, ge, other } = await loadLocalTransfers();
            await trpc.transferCredits.overrideAllTransfers.mutate({ courses, ap, ge, other });

            // the user data in redux is not correct and is thus "not loaded yet"
            // force-setting this is ok because it's equivalent to not having data loaded yet
            dispatch(setDataLoadState('loading'));
        },
        [dispatch, isLoggedIn]
    );

    useEffect(() => {
        dispatch(setRoadmapLoading(true));
    }, [dispatch]);

    // Read & upgrade the local roadmap, then trigger loading transfers
    useEffect(() => {
        // must wait for setRoadmapLoading(true) since that change will only trigger this useEffect once
        // This is to avoid issues with loadRoadmap() being called twice.
        if (!isRoadmapLoading || initialAccountRoadmap || initialLocalRoadmap) return;

        // Paint the last-seen account roadmap right away; the server copy below always replaces it
        // Transfer credits are independent of the roadmap, so request them alongside it rather than after it
        dispatch(setDataLoadState('loading'));

        const snapshot = isLoggedIn && userKey ? readRoadmapSnapshot(userKey) : null;
        if (snapshot) {
            prefetchPlannerCourses(snapshot.planners);
            expandAllPlanners(snapshot.planners).then((plans) => {
                if (serverRoadmapReceived.current) return;
                const timestamp = new Date(snapshot.timestamp ?? Date.now()).getTime();
                const currentPlanIndex = getPlanIndexFromQuery(plans) ?? snapshot.currentPlanIndex ?? 0;
                paintedSnapshot.current = snapshot;
                dispatch(setInitialPlannerData({ plans, timestamp, currentPlanIndex }));
                dispatch(setSnapshotPending(true));
                dispatch(setRoadmapLoading(false));
            });
        }

        loadRoadmap(isLoggedIn).then(({ accountRoadmap, localRoadmap }) => {
            serverRoadmapReceived.current = true;
            if (accountRoadmap && userKey) writeRoadmapSnapshot(userKey, accountRoadmap);
            // Fetch catalog data in parallel with the transfer-credit requests that gate rendering.
            const early = accountRoadmap ?? localRoadmap;
            if (early) prefetchPlannerCourses(early.planners);
            setInitialAccountRoadmap(accountRoadmap);
            setInitialLocalRoadmap(localRoadmap);
        });
    }, [
        dispatch,
        isRoadmapLoading,
        initialAccountRoadmap,
        initialLocalRoadmap,
        isLoggedIn,
        userKey,
        getPlanIndexFromQuery,
    ]);

    // Render the roadmap as soon as it's expanded; transfers only affect validation, which re-runs when they load
    useEffect(() => {
        if (!initialLocalRoadmap || roadmapLoaded) return;
        populateExistingRoadmap(initialAccountRoadmap ?? initialLocalRoadmap).then(() => setRoadmapLoaded(true));
    }, [populateExistingRoadmap, initialAccountRoadmap, initialLocalRoadmap, roadmapLoaded]);

    // After roadmap and transfers loaded, do roadmap conflict resolution
    const conflictChecked = useRef(false);
    useEffect(() => {
        if (!userTransfersLoaded || !roadmapLoaded || !initialLocalRoadmap || conflictChecked.current) return;
        conflictChecked.current = true;
        {
            if (!isLoggedIn) return;

            trpc.customCourses.getCustomCards.query().then((cards) => {
                const customCourses = cards.map((c) => ({
                    id: c.id,
                    courseName: c.name,
                    units: c.units,
                    description: c.description,
                }));
                dispatch(setCustomCourses(customCourses));
                customCourses.forEach((course) => dispatch(updateRoadmapCustomCourse(course)));
            });

            const isLocalNewer =
                new Date(initialLocalRoadmap.timestamp ?? 0) > new Date(initialAccountRoadmap?.timestamp ?? 0);

            // ignore local changes if account is newer
            if (!isLocalNewer) return;

            // Logged in + roadmap does exist but is older => prompt
            if (initialAccountRoadmap) return setShowSyncModal(true);

            // Logged in + doesn't exist => update everything
            saveRoadmapAndUpsertTransfers(initialLocalRoadmap.planners, null, initialLocalRoadmap.currentPlanIndex);
        }
    }, [
        saveRoadmapAndUpsertTransfers,
        isLoggedIn,
        userTransfersLoaded,
        initialAccountRoadmap,
        initialLocalRoadmap,
        roadmapLoaded,
        dispatch,
    ]);

    // Validate courses on change, but only once everything validation depends on has loaded (the server roadmap and
    // the user's transfer credits).
    // Validating the read-only snapshot or a roadmap without transfers would flag courses incorrectly.
    useEffect(() => {
        if (!roadmapLoaded || !userTransfersLoaded) return;
        const transferNames = getNamesOfTransfers(transferred.courses, transferred.ap, transferred.apInfo);
        const { invalidCourses } = validatePlanner(transferNames, currentPlanData, { isCHC });
        dispatch(setInvalidCourses(invalidCourses));
    }, [dispatch, currentPlanData, isCHC, transferred, roadmapLoaded, userTransfersLoaded]);

    const [overrideLoading, setOverrideLoading] = useState(false);

    const overrideAccountRoadmap = async () => {
        setOverrideLoading(true);
        const localRoadmap = readLocalRoadmap<SavedRoadmap>();

        // Update the account roadmap using local data
        await saveRoadmapAndUpsertTransfers(
            localRoadmap.planners,
            initialAccountRoadmap?.planners ?? null,
            localRoadmap.currentPlanIndex
        );
        const roadmapWithIds = await loadRoadmap(true).then((res) => res.accountRoadmap!);

        // Update frontend state to show local data
        populateExistingRoadmap(roadmapWithIds);
        setShowSyncModal(false);
    };

    const [accountLoading, setAccountLoading] = useState(false);

    const syncAccount = async () => {
        setAccountLoading(true);
        if (!initialAccountRoadmap || !initialLocalRoadmap) return;
        await saveRoadmap(isLoggedIn, initialAccountRoadmap?.planners ?? null, initialAccountRoadmap?.planners ?? null);
        setShowSyncModal(false);
    };

    return (
        <PlannerLoaderModal
            open={showSyncModal}
            onClose={setShowSyncModal}
            overrideLoading={overrideLoading}
            accountLoading={accountLoading}
            initialAccountRoadmap={initialAccountRoadmap}
            initialLocalRoadmap={initialLocalRoadmap}
            overrideAccountRoadmap={overrideAccountRoadmap}
            syncAccount={syncAccount}
        />
    );
};

export default PlannerLoader;
