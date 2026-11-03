import type { ProgramRequirement } from '@peterportal/types';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import EnrollmentStateControls from '../component/CourseInfo/EnrollmentStateControls';
import RepeatabilityWarning from '../component/CourseInfo/RepeatabilityWarning';
import { LOADING_COURSE_PLACEHOLDER, useCompletionCheck } from '../helpers/courseRequirements';
import { calculateTotalUnits } from '../helpers/planner';
import { roadmapEnrollmentId, totalEnrollmentCredit } from '../helpers/repeatability';
import { modifyCourseEnrollmentState } from '../helpers/roadmapEdits';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedTab } from '../store/slices/courseRequirementsSlice';
import {
    redoRoadmapRevision,
    reviseRoadmap,
    selectCurrentPlan,
    setInitialPlannerData,
    setPlanIndex,
    undoRoadmapRevision,
} from '../store/slices/roadmapSlice';
import { userSlice } from '../store/slices/userSlice';
import { generateStore } from '../store/store';
import type { RoadmapPlan } from '../types/types';
import { CourseCreditsProvider, useCourseCredits } from './courseCredits';

const requirement: ProgramRequirement<'Unit'> = {
    requirementId: 'research',
    requirementType: 'Unit',
    label: 'Research units',
    courses: ['COMPSCI199'],
    unitCount: 8,
};

function makePlan(id: number, repeats: boolean): RoadmapPlan {
    const course = {
        ...LOADING_COURSE_PLACEHOLDER,
        id: 'COMPSCI199',
        minUnits: 4,
        maxUnits: 4,
        repeatabilityTimes: 0,
        repeatabilityType: 'times' as const,
    };
    return {
        id,
        name: `Plan ${id}`,
        content: {
            invalidCourses: [],
            yearPlans: [
                {
                    startYear: 2026,
                    name: 'Year',
                    collapsed: false,
                    quarters: [
                        { name: 'Fall', courses: [course] },
                        ...(repeats ? [{ name: 'Winter' as const, courses: [course] }] : []),
                    ],
                },
            ],
        },
    };
}

function CreditFixture() {
    const dispatch = useAppDispatch();
    const plan = useAppSelector(selectCurrentPlan);
    const credits = useCourseCredits();
    const progress = useCompletionCheck(credits.completed, requirement);
    const year = plan.content.yearPlans[0];
    return (
        <>
            <span data-testid="credited-units">{totalEnrollmentCredit(credits.enrollments).unitCount}</span>
            <span data-testid="requirement-progress">{progress.completed}</span>
            <span data-testid="scheduled-units">
                {calculateTotalUnits(year.quarters.flatMap((q) => q.courses)).unitCount}
            </span>
            {year.quarters.map((quarter, index) => {
                const course = quarter.courses[0];
                if ('courseName' in course) return null;
                const credit = credits.byId.get(roadmapEnrollmentId(0, index, 0))!;
                return (
                    <div key={quarter.name}>
                        <EnrollmentStateControls
                            state={course}
                            automaticCountsForCredit={credit.automaticallyCountsForCredit}
                            onChange={(changes) => {
                                dispatch(
                                    reviseRoadmap(
                                        modifyCourseEnrollmentState(
                                            plan.id,
                                            year.startYear,
                                            quarter.name,
                                            0,
                                            course,
                                            changes
                                        )
                                    )
                                );
                            }}
                        />
                        <RepeatabilityWarning credit={credit} />
                    </div>
                );
            })}
        </>
    );
}

function setup() {
    const store = generateStore(userSlice.getInitialState());
    store.dispatch(setInitialPlannerData({ plans: [makePlan(1, true), makePlan(2, false)], timestamp: 0 }));
    render(
        <Provider store={store}>
            <CourseCreditsProvider>
                <CreditFixture />
            </CourseCreditsProvider>
        </Provider>
    );
    screen.getAllByText('Enrollment settings').forEach((summary) => fireEvent.click(summary));
    return store;
}

it('recalculates automatic retakes, overrides, warnings, totals, and requirement progress through undo/redo', () => {
    const store = setup();
    const checkboxes = () => screen.getAllByRole('checkbox', { name: 'Counts for credit' }) as HTMLInputElement[];
    expect(checkboxes().map((input) => input.checked)).toEqual([true, false]);
    expect(screen.getByTestId('credited-units').textContent).toBe('4');
    expect(screen.getByTestId('scheduled-units').textContent).toBe('8');
    expect(screen.getByText(/This enrollment does not count for credit/)).toBeTruthy();

    fireEvent.click(checkboxes()[0]);
    expect(checkboxes().map((input) => input.checked)).toEqual([false, true]);
    expect(screen.queryByText(/Repeat credit limit exceeded/)).toBeNull();
    expect(screen.getByTestId('requirement-progress').textContent).toBe('4');

    fireEvent.click(screen.getByRole('button', { name: 'Use course rules' }));
    expect(checkboxes().map((input) => input.checked)).toEqual([true, false]);
    fireEvent.click(checkboxes()[1]);
    expect(checkboxes().map((input) => input.checked)).toEqual([true, true]);
    expect(screen.getByTestId('credited-units').textContent).toBe('8');
    expect(screen.getByTestId('requirement-progress').textContent).toBe('8');
    expect(screen.getByText(/counts because you explicitly included it/)).toBeTruthy();
    act(() => {
        store.dispatch(setSelectedTab('Minor'));
    });
    expect(screen.getByTestId('credited-units').textContent).toBe('8');
    act(() => {
        store.dispatch(undoRoadmapRevision());
    });
    expect(checkboxes().map((input) => input.checked)).toEqual([true, false]);
    expect(screen.getByTestId('credited-units').textContent).toBe('4');
    act(() => {
        store.dispatch(redoRoadmapRevision());
    });
    expect(screen.getByTestId('credited-units').textContent).toBe('8');
});

it('evaluates the active plan independently when switching between plans', () => {
    const store = setup();
    act(() => {
        store.dispatch(setPlanIndex(1));
    });
    expect(screen.getByTestId('credited-units').textContent).toBe('4');
    expect(screen.queryByText(/Repeat credit limit exceeded/)).toBeNull();
    act(() => {
        store.dispatch(setPlanIndex(0));
    });
    expect(screen.getByTestId('credited-units').textContent).toBe('4');
    expect(screen.getByText(/This enrollment does not count for credit/)).toBeTruthy();
});
