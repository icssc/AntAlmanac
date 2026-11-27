import { ProfessorAAPIResponse } from '@peterportal/types';
import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { transformProfessorGQL } from '../../helpers/util';
import professorReducer from '../../store/slices/professorSlice';
import reviewReducer from '../../store/slices/reviewSlice';
import trpc from '../../trpc';
import ProfessorPreview from './ProfessorPreview';

jest.mock('../../trpc', () => ({
    __esModule: true,
    default: {
        professors: {
            get: { query: jest.fn() },
            grades: { query: jest.fn() },
        },
    },
}));
jest.mock('../GradeDist/Chart', () => () => null);
jest.mock('../Schedule/Schedule', () => () => null);
jest.mock('../Review/Review', () => () => null);

const professorA: ProfessorAAPIResponse = {
    ucinetid: 'professor_a',
    name: 'Professor A',
    title: 'Professor',
    email: '',
    department: 'Computer Science',
    shortenedNames: ['A, P.'],
    courses: [],
};
const professorB: ProfessorAAPIResponse = {
    ...professorA,
    ucinetid: 'professor_b',
    name: 'Professor B',
    shortenedNames: ['B, P.'],
};

it('shows loading and starts no work for the old professor while another instructor loads', async () => {
    let resolveProfessor!: (professor: ProfessorAAPIResponse) => void;
    jest.mocked(trpc.professors.get.query).mockReturnValue(
        new Promise((resolve) => {
            resolveProfessor = resolve;
        })
    );
    const gradesQuery = jest.mocked(trpc.professors.grades.query).mockResolvedValue([]);
    const store = configureStore({
        reducer: { professors: professorReducer, review: reviewReducer },
        preloadedState: {
            professors: { professors: { [professorA.ucinetid]: transformProfessorGQL(professorA) } },
        },
    });
    const preview = (netid: string) => (
        <Provider store={store}>
            <ProfessorPreview netid={netid} onClose={() => {}} onBack={() => {}} showBack={false} />
        </Provider>
    );
    const view = render(preview(professorA.ucinetid));
    await waitFor(() => expect(gradesQuery).toHaveBeenCalledWith({ name: 'A, P.' }));
    gradesQuery.mockClear();

    view.rerender(preview(professorB.ucinetid));

    expect(screen.getByText('Loading professor_b...')).toBeTruthy();
    expect(view.container.querySelector('#preview-details h2')?.textContent).toBe('Firstname Lastname');
    expect(gradesQuery).not.toHaveBeenCalled();

    await act(async () => resolveProfessor(professorB));

    expect(screen.getByText('Previewing')).toBeTruthy();
    expect(view.container.querySelector('#preview-details h2')?.textContent).toBe('Professor B');
    expect(gradesQuery).toHaveBeenCalledWith({ name: 'B, P.' });
    expect(gradesQuery).not.toHaveBeenCalledWith({ name: 'A, P.' });
});
