import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import trpc from '../trpc';
import { transformProfessorGQL } from '../helpers/util.tsx';
import { setProfessor } from '../store/slices/professorSlice.ts';
import { ProfessorGQLData } from '../types/types.ts';

// Get a professor's info (name, net ID, etc.)
// If not in cache then fetch from API and put in cache

export function useProfessorData(netID: string) {
  const professorCache = useAppSelector((state) => state.professors.professors);
  const [fullProfessorData, setFullProfessorData] = useState<ProfessorGQLData | null>(professorCache[netID] ?? null);
  const [loadTrigger, setLoadTrigger] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // Use a stateful trigger to avoid sending two requests as a result of double first render
    setLoadTrigger(true);
  }, [netID]);

  useEffect(() => {
    if (!loadTrigger) return;
    setLoadTrigger(false);

    const cachedProfessor = professorCache[netID];

    if (cachedProfessor) {
      setFullProfessorData(cachedProfessor);
      return;
    }

    setFullProfessorData(null);
    trpc.professors.get.query({ ucinetid: netID }).then((professor) => {
      const transformedProfessor = transformProfessorGQL(professor);
      setFullProfessorData(transformedProfessor);

      dispatch(setProfessor({ professorId: netID, data: transformedProfessor }));
    });
  }, [netID, dispatch, loadTrigger, professorCache]);

  return fullProfessorData;
}
