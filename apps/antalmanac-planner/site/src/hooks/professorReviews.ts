import { ProfessorAAPIResponse } from '@peterportal/types';
import { useEffect, useState } from 'react';

import { transformProfessorGQL } from '../helpers/util.tsx';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setProfessor } from '../store/slices/professorSlice.ts';
import trpc from '../trpc';
import { ProfessorGQLData } from '../types/types.ts';

// Get a professor's info (name, net ID, etc.)
// If not in cache then fetch from API and put in cache

/** `professorPromise` is the server's fetch of this professor, used instead of fetching it again in the browser */
export function useProfessorData(netID: string, professorPromise?: Promise<ProfessorAAPIResponse | null>) {
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
        Promise.resolve(professorPromise ?? trpc.professors.get.query({ ucinetid: netID })).then((professor) => {
            // an unknown professor stays null; the page shows not-found from the server
            if (!professor) return;
            const transformedProfessor = transformProfessorGQL(professor);
            setFullProfessorData(transformedProfessor);

            dispatch(setProfessor({ professorId: netID, data: transformedProfessor }));
        });
    }, [netID, dispatch, loadTrigger, professorCache, professorPromise]);

    return fullProfessorData;
}
