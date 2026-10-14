import { ProfessorAAPIResponse } from '@peterportal/types';
import { use, useEffect, useMemo, useState } from 'react';

import { transformProfessorGQL } from '../helpers/util.tsx';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setProfessor } from '../store/slices/professorSlice.ts';
import trpc from '../trpc';
import { ProfessorGQLData } from '../types/types.ts';

/**
 * Resolves a professor from the cache, else from `professorPromise` (the server's fetch, which suspends until
 * it arrives), else by fetching it in the browser
 */
export function useProfessorData(netID: string, professorPromise?: Promise<ProfessorAAPIResponse | null>) {
    const professorCache = useAppSelector((state) => state.professors.professors);
    const serverProfessor = !professorCache[netID] && professorPromise ? use(professorPromise) : undefined;
    const transformedServerProfessor = useMemo(
        () => serverProfessor && transformProfessorGQL(serverProfessor),
        [serverProfessor]
    );
    const [fullProfessorData, setFullProfessorData] = useState<ProfessorGQLData | null>(professorCache[netID] ?? null);
    const [loadTrigger, setLoadTrigger] = useState(false);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (transformedServerProfessor)
            dispatch(setProfessor({ professorId: netID, data: transformedServerProfessor }));
    }, [netID, dispatch, transformedServerProfessor]);

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
        if (professorPromise) return;

        setFullProfessorData(null);
        trpc.professors.get.query({ ucinetid: netID }).then((professor) => {
            const transformedProfessor = transformProfessorGQL(professor);
            setFullProfessorData(transformedProfessor);

            dispatch(setProfessor({ professorId: netID, data: transformedProfessor }));
        });
    }, [netID, dispatch, loadTrigger, professorCache, professorPromise]);

    return professorCache[netID] ?? transformedServerProfessor ?? fullProfessorData;
}
