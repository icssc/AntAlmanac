import { CourseAAPIResponse } from '@peterportal/types';
import { use, useEffect, useMemo, useState } from 'react';

import { LOADING_COURSE_PLACEHOLDER } from '../helpers/courseRequirements';
import { transformCourseGQL } from '../helpers/util';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCourse } from '../store/slices/courseCatalogSlice';
import { setToastMsg, setToastSeverity, setShowToast } from '../store/slices/roadmapSlice';
import trpc from '../trpc';

/**
 * Resolves a course from the cache, else from `coursePromise` (the server's fetch, which suspends until it
 * arrives), else by fetching it in the browser
 */
export function useCourseData(courseId: string, coursePromise?: Promise<CourseAAPIResponse | null>) {
    const courseCache = useAppSelector((state) => state.courseCatalog.courses);
    const serverCourse = !courseCache[courseId] && coursePromise ? use(coursePromise) : undefined;
    const transformedServerCourse = useMemo(() => serverCourse && transformCourseGQL(serverCourse), [serverCourse]);
    const [fullCourseData, setFullCourseData] = useState(courseCache[courseId] ?? LOADING_COURSE_PLACEHOLDER);
    const [loadTrigger, setLoadTrigger] = useState(false);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (transformedServerCourse) dispatch(setCourse({ courseId, data: transformedServerCourse }));
    }, [courseId, dispatch, transformedServerCourse]);

    useEffect(() => {
        // Use a stateful trigger to avoid sending two requests as a result of double first render
        setLoadTrigger(true);
    }, [courseId]);

    useEffect(() => {
        if (!loadTrigger) return;
        setLoadTrigger(false);

        const cachedCourse = courseCache[courseId];

        if (cachedCourse) {
            setFullCourseData(cachedCourse);
            return;
        }
        if (coursePromise) return;

        setFullCourseData(LOADING_COURSE_PLACEHOLDER);
        trpc.courses.get
            .query({ courseID: courseId })
            .then((course) => {
                const transformedCourse = transformCourseGQL(course);
                setFullCourseData(transformedCourse);
                dispatch(setCourse({ courseId, data: transformedCourse }));
            })
            .catch(() => {
                dispatch(setToastMsg('Copied course URL to clipboard!'));
                dispatch(setToastSeverity('success'));
                dispatch(setShowToast(true));
            });
    }, [courseId, dispatch, loadTrigger, courseCache, coursePromise]);

    return courseCache[courseId] ?? transformedServerCourse ?? fullCourseData;
}
