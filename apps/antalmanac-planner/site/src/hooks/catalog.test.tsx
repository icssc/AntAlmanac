import { CourseAAPIResponse, ProfessorAAPIResponse } from '@peterportal/types';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { LOADING_COURSE_PLACEHOLDER } from '../helpers/courseRequirements';
import { transformCourseGQL, transformProfessorGQL } from '../helpers/util';
import courseCatalogReducer, { setCourse } from '../store/slices/courseCatalogSlice';
import professorReducer, { setProfessor } from '../store/slices/professorSlice';
import roadmapReducer from '../store/slices/roadmapSlice';
import trpc from '../trpc';
import { useCourseData } from './catalog';
import { useProfessorData } from './professorReviews';

jest.mock('../trpc', () => ({
    __esModule: true,
    default: {
        courses: { get: { query: jest.fn() } },
        professors: { get: { query: jest.fn() } },
    },
}));

const course: CourseAAPIResponse = {
    ...LOADING_COURSE_PLACEHOLDER,
    id: 'COMPSCI161',
    title: 'Original course title',
    instructors: [],
    prerequisites: [],
    dependencies: [],
};

const professor: ProfessorAAPIResponse = {
    ucinetid: 'instructor',
    name: 'Original instructor name',
    title: '',
    email: '',
    department: 'Computer Science',
    shortenedNames: [],
    courses: [],
};

function setup() {
    const store = configureStore({
        reducer: { courseCatalog: courseCatalogReducer, professors: professorReducer, roadmap: roadmapReducer },
    });
    const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
    return { store, wrapper };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

describe('server-provided catalog data', () => {
    it('uses a replacement course promise after the same ID has been cached', async () => {
        const { store, wrapper } = setup();
        const { result, rerender } = renderHook(({ promise }) => useCourseData(course.id, promise), {
            initialProps: { promise: Promise.resolve(course) },
            wrapper,
        });
        await act(async () => {});
        expect(result.current.title).toBe('Original course title');
        expect(store.getState().courseCatalog.courses[course.id].title).toBe('Original course title');

        rerender({ promise: Promise.resolve({ ...course, title: 'Updated course title' }) });
        await act(async () => {});

        expect(result.current.title).toBe('Updated course title');
        expect(store.getState().courseCatalog.courses[course.id].title).toBe('Updated course title');
        expect(trpc.courses.get.query).not.toHaveBeenCalled();
    });

    it('uses a replacement professor promise after the same ID has been cached', async () => {
        const { store, wrapper } = setup();
        const { result, rerender } = renderHook(({ promise }) => useProfessorData(professor.ucinetid, promise), {
            initialProps: { promise: Promise.resolve(professor) },
            wrapper,
        });
        await act(async () => {});
        expect(result.current?.name).toBe('Original instructor name');

        rerender({ promise: Promise.resolve({ ...professor, name: 'Updated instructor name' }) });
        await act(async () => {});

        expect(result.current?.name).toBe('Updated instructor name');
        expect(store.getState().professors.professors[professor.ucinetid].name).toBe('Updated instructor name');
        expect(trpc.professors.get.query).not.toHaveBeenCalled();
    });

    it('ignores a superseded course refresh in both returned and cached data', async () => {
        const { store, wrapper } = setup();
        store.dispatch(setCourse({ courseId: course.id, data: transformCourseGQL(course) }));
        const older = deferred<CourseAAPIResponse>();
        const newer = deferred<CourseAAPIResponse>();
        const { result, rerender } = renderHook(({ promise }) => useCourseData(course.id, promise), {
            initialProps: { promise: older.promise },
            wrapper,
        });

        rerender({ promise: newer.promise });
        await act(async () => newer.resolve({ ...course, title: 'Newest course title' }));
        expect(result.current.title).toBe('Newest course title');
        await act(async () => older.resolve({ ...course, title: 'Outdated course title' }));

        expect(result.current.title).toBe('Newest course title');
        expect(store.getState().courseCatalog.courses[course.id].title).toBe('Newest course title');
    });

    it('ignores a superseded professor refresh in both returned and cached data', async () => {
        const { store, wrapper } = setup();
        store.dispatch(setProfessor({ professorId: professor.ucinetid, data: transformProfessorGQL(professor) }));
        const older = deferred<ProfessorAAPIResponse>();
        const newer = deferred<ProfessorAAPIResponse>();
        const { result, rerender } = renderHook(({ promise }) => useProfessorData(professor.ucinetid, promise), {
            initialProps: { promise: older.promise },
            wrapper,
        });

        rerender({ promise: newer.promise });
        await act(async () => newer.resolve({ ...professor, name: 'Newest instructor name' }));
        expect(result.current?.name).toBe('Newest instructor name');
        await act(async () => older.resolve({ ...professor, name: 'Outdated instructor name' }));

        expect(result.current?.name).toBe('Newest instructor name');
        expect(store.getState().professors.professors[professor.ucinetid].name).toBe('Newest instructor name');
    });

    it('keeps using the course cache when no server promise is supplied', () => {
        const { store, wrapper } = setup();
        store.dispatch(setCourse({ courseId: course.id, data: transformCourseGQL(course) }));

        const { result } = renderHook(() => useCourseData(course.id), { wrapper });

        expect(result.current.title).toBe('Original course title');
        expect(trpc.courses.get.query).not.toHaveBeenCalled();
    });

    it('keeps using the professor cache when no server promise is supplied', () => {
        const { store, wrapper } = setup();
        store.dispatch(setProfessor({ professorId: professor.ucinetid, data: transformProfessorGQL(professor) }));

        const { result } = renderHook(() => useProfessorData(professor.ucinetid), { wrapper });

        expect(result.current?.name).toBe('Original instructor name');
        expect(trpc.professors.get.query).not.toHaveBeenCalled();
    });

    it('leaves server course errors to the page without a copy-link success toast', async () => {
        const { store, wrapper } = setup();
        const request = deferred<CourseAAPIResponse>();
        const pageError = request.promise.catch(() => {});
        renderHook(() => useCourseData(course.id, request.promise), { wrapper });

        await act(async () => {
            request.reject(new Error('Course unavailable'));
            await pageError;
        });

        expect(store.getState().roadmap.showToast).toBe(false);
    });

    it('shows a course loading error when the browser request fails', async () => {
        const { store, wrapper } = setup();
        jest.mocked(trpc.courses.get.query).mockRejectedValueOnce(new Error('Course unavailable'));

        renderHook(() => useCourseData(course.id), { wrapper });
        await act(async () => {});

        expect(store.getState().roadmap.showToast).toBe(true);
        expect(store.getState().roadmap.toastSeverity).toBe('error');
        expect(store.getState().roadmap.toastMsg).toBe('Unable to load course');
    });

    it('handles server professor failures even when the page catches the original promise', async () => {
        const { store, wrapper } = setup();
        const request = deferred<ProfessorAAPIResponse>();
        const pageError = request.promise.catch(() => {});
        const { result } = renderHook(() => useProfessorData(professor.ucinetid, request.promise), { wrapper });

        await act(async () => {
            request.reject(new Error('Instructor unavailable'));
            await pageError;
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current).toBeNull();
        expect(store.getState().roadmap.showToast).toBe(false);
    });

    it('shows an instructor loading error when the browser request fails', async () => {
        const { store, wrapper } = setup();
        jest.mocked(trpc.professors.get.query).mockRejectedValueOnce(new Error('Instructor unavailable'));

        renderHook(() => useProfessorData(professor.ucinetid), { wrapper });
        await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

        expect(store.getState().roadmap.showToast).toBe(true);
        expect(store.getState().roadmap.toastSeverity).toBe('error');
        expect(store.getState().roadmap.toastMsg).toBe('Unable to load instructor');
    });
});
