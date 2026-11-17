import { CourseAAPIResponse } from '@peterportal/types';
import { useEffect, useRef, useState } from 'react';

import { LOADING_COURSE_PLACEHOLDER } from '../helpers/courseRequirements';
import { transformCourseGQL } from '../helpers/util';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCourse } from '../store/slices/courseCatalogSlice';
import { setToastMsg, setToastSeverity, setShowToast } from '../store/slices/roadmapSlice';
import trpc from '../trpc';

/** `coursePromise` is the server's fetch of this course, used instead of fetching it again in the browser */
export function useCourseData(courseId: string, coursePromise?: Promise<CourseAAPIResponse | null>) {
    const courseCache = useAppSelector((state) => state.courseCatalog.courses);
    const [fullCourseData, setFullCourseData] = useState(courseCache[courseId] ?? LOADING_COURSE_PLACEHOLDER);
    const [loadTrigger, setLoadTrigger] = useState(false);
    const requestId = useRef(0);

    const dispatch = useAppDispatch();

    useEffect(() => {
        requestId.current += 1;
        // Use a stateful trigger to avoid sending two requests as a result of double first render
        setLoadTrigger(true);
        return () => {
            requestId.current += 1;
        };
    }, [courseId, coursePromise]);

    useEffect(() => {
        if (!loadTrigger) return;
        setLoadTrigger(false);
        const currentRequestId = requestId.current;

        const cachedCourse = courseCache[courseId];

        if (cachedCourse && !coursePromise) {
            setFullCourseData(cachedCourse);
            return;
        }

        setFullCourseData(LOADING_COURSE_PLACEHOLDER);
        Promise.resolve(coursePromise ?? trpc.courses.get.query({ courseID: courseId }))
            .then((course) => {
                if (currentRequestId !== requestId.current) return;
                // an unknown course stays a placeholder; the page shows not-found from the server
                if (!course) return;
                const transformedCourse = transformCourseGQL(course);
                setFullCourseData(transformedCourse);
                dispatch(setCourse({ courseId, data: transformedCourse }));
            })
            .catch(() => {
                if (currentRequestId !== requestId.current || coursePromise) return;
                dispatch(setToastMsg('Unable to load course'));
                dispatch(setToastSeverity('error'));
                dispatch(setShowToast(true));
            });
    }, [courseId, dispatch, loadTrigger, courseCache, coursePromise]);

    return fullCourseData;
}
