import { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setDepartments } from '../store/slices/departmentsSlice';
import trpc from '../trpc';

export function useLoadDepartments() {
  const dispatch = useAppDispatch();
  const [loadTrigger, setLoadTrigger] = useState(false);

  useEffect(() => {
    setLoadTrigger(true);
  }, []);

  useEffect(() => {
    if (!loadTrigger) return;
    setLoadTrigger(false);

    // set departments
    trpc.departments.get
      .query()
      .then((res) => {
        const departmentsRecord: Record<string, string> = {};
        res.forEach((dept) => {
          departmentsRecord[dept.deptCode] = dept.deptName;
        });

        dispatch(setDepartments(departmentsRecord));
      })
      .catch(() => {
        console.error('Error fetching the departments from tRPC');
      });
  }, [dispatch, loadTrigger]);
}
