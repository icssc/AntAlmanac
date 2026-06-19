import { useEffect } from 'react';
import { loadMarkerCompletion, loadOverriddenRequirements } from '../helpers/courseRequirements';
import { useIsLoggedIn } from './isLoggedIn';
import { selectCurrentPlan } from '../store/slices/roadmapSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { initializeCompletedMarkers, initializeOverriddenRequirements } from '../store/slices/courseRequirementsSlice';

export function useLoadCompletedMarkers() {
  const isLoggedIn = useIsLoggedIn();
  const dispatch = useAppDispatch();

  // Load user-related Degree Requirements data (as opposed to AAPI-provided data)
  useEffect(() => {
    loadMarkerCompletion(isLoggedIn).then((completedMarkers) => {
      dispatch(initializeCompletedMarkers(completedMarkers));
    });
  }, [dispatch, isLoggedIn]);
}

export function useLoadOverriddenRequirements() {
  const isLoggedIn = useIsLoggedIn();
  const dispatch = useAppDispatch();

  const activePlanID = useAppSelector(selectCurrentPlan)?.id;

  useEffect(() => {
    if (!activePlanID) return;
    loadOverriddenRequirements(activePlanID, isLoggedIn).then((overriddenRequirements) => {
      dispatch(initializeOverriddenRequirements({ plannerId: activePlanID, requirements: overriddenRequirements }));
    });
  }, [dispatch, activePlanID, isLoggedIn]);
}
