import type { ProgramRequirement } from '@peterportal/types';
import { useEffect, useMemo, useState } from 'react';

import {
    getCatalogOfferingStatuses,
    getRequirementCourseIds,
    OfferingQuarter,
    parseOfferingTerm,
} from '../helpers/courseOfferings';
import { searchAPIResults } from '../helpers/util';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCourses } from '../store/slices/courseCatalogSlice';

export function useCatalogOfferings(requirements: readonly ProgramRequirement[], quarter: OfferingQuarter | null) {
    const courses = useAppSelector((state) => state.courseCatalog.courses);
    const currentQuarter = useAppSelector((state) => state.schedule.currentQuarter);
    const dispatch = useAppDispatch();
    const [error, setError] = useState<unknown>();
    const courseIds = useMemo(() => getRequirementCourseIds(requirements), [requirements]);
    const missingKey = JSON.stringify(courseIds.filter((id) => !courses[id]));

    useEffect(() => {
        const missingIds = JSON.parse(missingKey) as string[];
        let cancelled = false;
        setError(undefined);
        if (!missingIds.length) return;
        searchAPIResults('courses', missingIds)
            .then((courses) => {
                if (cancelled) return;
                dispatch(setCourses(courses));
            })
            .catch((error: unknown) => {
                if (!cancelled) setError(error);
            });
        return () => {
            cancelled = true;
        };
    }, [dispatch, missingKey]);

    const statuses = useMemo(
        () =>
            quarter ? getCatalogOfferingStatuses(courseIds, courses, quarter, parseOfferingTerm(currentQuarter)) : {},
        [courseIds, courses, quarter, currentQuarter]
    );
    return { statuses, error };
}
