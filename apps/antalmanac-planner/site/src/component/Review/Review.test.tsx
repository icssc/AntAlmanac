import { CourseAAPIResponse, ReviewData } from '@peterportal/types';
import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import CoursePage from '../../app/course/CoursePage';
import { LOADING_COURSE_PLACEHOLDER } from '../../helpers/courseRequirements';
import courseCatalogReducer from '../../store/slices/courseCatalogSlice';
import reviewReducer from '../../store/slices/reviewSlice';
import scheduleReducer from '../../store/slices/scheduleSlice';
import userReducer from '../../store/slices/userSlice';
import trpc from '../../trpc';

jest.mock('../../trpc', () => ({
    __esModule: true,
    default: { reviews: { get: { query: jest.fn() } } },
}));
jest.mock('../GradeDist/GradeDist', () => () => null);
jest.mock('../Schedule/Schedule', () => () => null);
jest.mock('../PrereqTree/PrereqTree', () => () => null);
jest.mock('../ReviewForm/ReviewForm', () => () => null);
jest.mock('./ReviewCard', () => () => null);

const course = {
    ...LOADING_COURSE_PLACEHOLDER,
    id: 'COMPSCI161',
    department: 'COMPSCI',
    courseNumber: '161',
    title: 'Design and Analysis of Algorithms',
};
const nextCourse = { ...course, id: 'COMPSCI162', courseNumber: '162' };
const coursePromises: Record<string, Promise<CourseAAPIResponse | null>> = Object.fromEntries(
    [course, nextCourse].map((data) => [
        data.id,
        Promise.resolve({ ...data, instructors: [], prerequisites: [], dependencies: [] }),
    ])
);
const query = jest.mocked(trpc.reviews.get.query);

function renderPage() {
    const store = configureStore({
        reducer: {
            courseCatalog: courseCatalogReducer,
            review: reviewReducer,
            schedule: scheduleReducer,
            user: userReducer,
        },
        preloadedState: {
            courseCatalog: { courses: { [course.id]: course, [nextCourse.id]: nextCourse } },
        },
    });
    const page = (id: string) => (
        <Provider store={store}>
            <CoursePage courseId={id} coursePromise={coursePromises[id]} />
        </Provider>
    );
    const result = render(page(course.id));
    return { ...result, showCourse: (id: string) => result.rerender(page(id)) };
}

describe('review loading outcomes', () => {
    beforeEach(() => {
        query.mockReset();
    });

    it('shows a failed request instead of claiming that the course has no reviews', async () => {
        query.mockRejectedValue(new Error('Network unavailable'));

        const { container } = renderPage();

        expect(container.querySelector('.add-review-button div')).toBeNull();
        await waitFor(() => expect(container.querySelector('.reviews [role="alert"]')).not.toBeNull());
        expect(screen.queryByText('No reviews found for this course!')).toBeNull();
        expect(container.querySelector('.side-info-ratings')?.textContent).toContain('Unable to load reviews');
        expect(container.querySelector('.side-info-ratings .MuiSkeleton-root')).toBeNull();
    });

    it('keeps the empty state for a successful request with no reviews', async () => {
        query.mockResolvedValue([]);

        renderPage();

        expect(await screen.findByText('No reviews found for this course!')).not.toBeNull();
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('ignores a failed request after moving to another course', async () => {
        let rejectPrevious: (error: Error) => void = () => {};
        const previousRequest = new Promise<ReviewData[]>((_, reject) => {
            rejectPrevious = reject;
        });
        query.mockImplementation(({ courseId }) => (courseId === course.id ? previousRequest : Promise.resolve([])));
        const { showCourse } = renderPage();
        await waitFor(() => expect(query).toHaveBeenCalledWith({ courseId: course.id }));
        showCourse(nextCourse.id);
        expect(await screen.findByText('No reviews found for this course!')).not.toBeNull();

        await act(async () => rejectPrevious(new Error('Previous request failed')));

        expect(screen.queryByRole('alert')).toBeNull();
        expect(screen.getByText('No reviews found for this course!')).not.toBeNull();
    });
});
