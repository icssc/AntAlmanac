import { useEffect } from 'react';
import { loadMarkerCompletion } from '../helpers/courseRequirements';
import { useIsLoggedIn } from './isLoggedIn';
import { useAppDispatch } from '../store/hooks';
import { initializeCompletedMarkers } from '../store/slices/courseRequirementsSlice';

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
