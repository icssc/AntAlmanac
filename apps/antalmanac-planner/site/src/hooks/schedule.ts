import { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCurrentWeek, setCurrentQuarter } from '../store/slices/scheduleSlice';
import trpc from '../trpc';

export function useSetSchedule() {
  const dispatch = useAppDispatch();
  const [loadTrigger, setLoadTrigger] = useState(false);

  useEffect(() => {
    setLoadTrigger(true);
  }, []);

  useEffect(() => {
    if (!loadTrigger) return;
    setLoadTrigger(false);

    // set current week
    trpc.schedule.currentWeek
      .query()
      .then((res) => {
        dispatch(setCurrentWeek(res.display));
      })
      .catch(() => {
        console.error('Error fetching the current week number from tRPC');
      });

    // set current quarter
    trpc.schedule.currentQuarter
      .query()
      .then((res) => {
        dispatch(setCurrentQuarter(res));
      })
      .catch(() => {
        console.error('Error fetching the current quarter (aka term) from tRPC');
      });
  }, [dispatch, loadTrigger]);
}
