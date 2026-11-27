import { GradesRaw } from '@peterportal/types';
import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { LOADING_COURSE_PLACEHOLDER } from '../../helpers/courseRequirements';
import reviewReducer from '../../store/slices/reviewSlice';
import trpc from '../../trpc';
import GradeDist from './GradeDist';

jest.mock('../../trpc', () => ({
    __esModule: true,
    default: { courses: { grades: { query: jest.fn() } } },
}));
jest.mock('./Chart', () => () => null);

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

function grades(courseNumber: string, students: number): GradesRaw {
    return [
        {
            department: 'COMPSCI',
            courseNumber,
            courseNumeric: Number(courseNumber),
            year: '2026',
            quarter: 'Fall',
            sectionCode: '12345',
            geCategories: [],
            instructors: ['INSTRUCTOR'],
            gradeACount: students,
            gradeBCount: 0,
            gradeCCount: 0,
            gradeDCount: 0,
            gradeFCount: 0,
            gradePCount: 0,
            gradeNPCount: 0,
            gradeWCount: 0,
            averageGPA: 4,
        },
    ];
}

it.each(['success', 'failure'])('ignores an older grade request that completes with %s', async (outcome) => {
    const oldRequest = deferred<GradesRaw>();
    const currentRequest = deferred<GradesRaw>();
    jest.mocked(trpc.courses.grades.query)
        .mockReturnValueOnce(oldRequest.promise)
        .mockReturnValueOnce(currentRequest.promise);
    const store = configureStore({ reducer: { review: reviewReducer } });
    const courseA = { ...LOADING_COURSE_PLACEHOLDER, id: 'COMPSCI161', department: 'COMPSCI', courseNumber: '161' };
    const courseB = { ...courseA, id: 'COMPSCI162', courseNumber: '162' };
    const view = render(
        <Provider store={store}>
            <GradeDist course={courseA} />
        </Provider>
    );
    view.rerender(
        <Provider store={store}>
            <GradeDist skeleton />
        </Provider>
    );
    view.rerender(
        <Provider store={store}>
            <GradeDist course={courseB} />
        </Provider>
    );
    await act(async () => currentRequest.resolve(grades('162', 20)));
    expect(screen.getByText('Total Students: 20')).toBeTruthy();

    await act(async () => {
        if (outcome === 'success') oldRequest.resolve(grades('161', 10));
        else oldRequest.reject(new Error('Old request failed'));
    });

    expect(screen.getByText('Total Students: 20')).toBeTruthy();
});
