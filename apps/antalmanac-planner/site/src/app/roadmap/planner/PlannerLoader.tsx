'use client';
import { FC, useCallback, useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import {
  collapseAllPlanners,
  expandAllPlanners,
  loadRoadmap,
  readLocalRoadmap,
  saveRoadmap,
  validatePlanner,
} from '../../../helpers/planner';
import { SavedPlannerData, SavedRoadmap } from '@peterportal/types';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectYearPlans,
  setInitialPlannerData,
  setInvalidCourses,
  setRoadmapLoading,
  setToastMsg,
  setToastSeverity,
  setShowToast,
  updateTempPlannerIds,
} from '../../../store/slices/roadmapSlice';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';
import {
  getNamesOfTransfers,
  loadTransferredAPs,
  loadTransferredCourses,
  loadTransferredGEs,
  loadTransferredOther,
} from '../../../helpers/transferCredits';
import { useTransferredCredits } from '../../../hooks/transferCredits';
import trpc from '../../../trpc';
import { setDataLoadState } from '../../../store/slices/transferCreditsSlice';
import { compareRoadmaps, restoreRevision } from '../../../helpers/roadmap';
import { deepCopy } from '../../../helpers/util';

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
  const isRoadmapLoading = useAppSelector((state) => state.roadmap.roadmapLoading);
  const isLoggedIn = useIsLoggedIn();
  useCheckUnsavedChanges();

  const [roadmapLoaded, setRoadmapLoaded] = useState(false);
  const [initialLocalRoadmap, setInitialLocalRoadmap] = useState<SavedRoadmap | null>(null);
  const [initialAccountRoadmap, setInitialAccountRoadmap] = useState<SavedRoadmap | null>(null);

  const dispatch = useAppDispatch();

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
      const timestamp = new Date(roadmap.timestamp ?? Date.now()).getTime();
      dispatch(setInitialPlannerData({ plans, timestamp, currentPlanIndex: roadmap.currentPlanIndex ?? 0 }));
      dispatch(setRoadmapLoading(false));
    },
    [dispatch],
  );

  // save function will update localStorage (thus comparisons above will work) and account roadmap
  const saveRoadmapAndUpsertTransfers = useCallback(
    async (
      collapsedLocalPlans: SavedPlannerData[],
      collapsedAccountPlans: SavedPlannerData[] | null,
      currentPlanIndex?: number,
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
    [dispatch, isLoggedIn],
  );

  useEffect(() => {
    dispatch(setRoadmapLoading(true));
  }, [dispatch]);

  // Read & upgrade the local roadmap, then trigger loading transfers
  useEffect(() => {
    // must wait for setRoadmapLoading(true) since that change will only trigger this useEffect once
    // This is to avoid issues with loadRoadmap() being called twice.
    if (!isRoadmapLoading || initialAccountRoadmap || initialLocalRoadmap) return;

    loadRoadmap(isLoggedIn).then(({ accountRoadmap, localRoadmap }) => {
      setInitialAccountRoadmap(accountRoadmap);
      setInitialLocalRoadmap(localRoadmap);
      dispatch(setDataLoadState('loading'));
    });
  }, [dispatch, isRoadmapLoading, initialAccountRoadmap, initialLocalRoadmap, isLoggedIn]);

  // After transfers loaded, do roadmap conflict resolution
  useEffect(() => {
    if (!userTransfersLoaded || !initialLocalRoadmap || roadmapLoaded) return;

    populateExistingRoadmap(initialAccountRoadmap ?? initialLocalRoadmap).then(() => {
      setRoadmapLoaded(true);

      if (!isLoggedIn) return;
      const isLocalNewer =
        new Date(initialLocalRoadmap.timestamp ?? 0) > new Date(initialAccountRoadmap?.timestamp ?? 0);

      // ignore local changes if account is newer
      if (!isLocalNewer) return;

      // Logged in + roadmap does exist but is older => prompt
      if (initialAccountRoadmap) return setShowSyncModal(true);

      // Logged in + doesn't exist => update everything
      saveRoadmapAndUpsertTransfers(initialLocalRoadmap.planners, null, initialLocalRoadmap.currentPlanIndex);
    });
  }, [
    saveRoadmapAndUpsertTransfers,
    isLoggedIn,
    populateExistingRoadmap,
    userTransfersLoaded,
    initialAccountRoadmap,
    initialLocalRoadmap,
    roadmapLoaded,
  ]);

  // Validate Courses on change
  useEffect(() => {
    const transferNames = getNamesOfTransfers(transferred.courses, transferred.ap, transferred.apInfo);
    const { invalidCourses } = validatePlanner(transferNames, currentPlanData);
    dispatch(setInvalidCourses(invalidCourses));
  }, [dispatch, currentPlanData, transferred]);

  const [overrideLoading, setOverrideLoading] = useState(false);

  const overrideAccountRoadmap = async () => {
    setOverrideLoading(true);
    const localRoadmap = readLocalRoadmap<SavedRoadmap>();

    // Update the account roadmap using local data
    await saveRoadmapAndUpsertTransfers(
      localRoadmap.planners,
      initialAccountRoadmap?.planners ?? null,
      localRoadmap.currentPlanIndex,
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
    <Dialog
      open={showSyncModal}
      onClose={() => {
        setShowSyncModal(false);
      }}
    >
      <DialogTitle>Roadmap Out of Sync</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This device's saved roadmap has newer changes than the one saved to your account. Where would you like to load
          your roadmap from?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          loading={overrideLoading}
          disabled={overrideLoading || accountLoading}
          color="inherit"
          variant="text"
          onClick={overrideAccountRoadmap}
        >
          This Device
        </Button>
        <Button
          loading={accountLoading}
          disabled={overrideLoading || accountLoading}
          variant="contained"
          onClick={syncAccount}
        >
          My Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlannerLoader;
