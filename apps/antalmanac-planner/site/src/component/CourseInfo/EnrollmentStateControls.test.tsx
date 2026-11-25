import type { CourseEnrollmentState } from '@peterportal/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';

import EnrollmentStateControls from './EnrollmentStateControls';

function Enrollments() {
    const [states, setStates] = useState<CourseEnrollmentState[]>([{}, { countsForCredit: false }]);
    return (
        <>
            {states.map((state, index) => (
                <EnrollmentStateControls
                    key={index}
                    state={state}
                    onChange={(changes) => {
                        setStates((previous) =>
                            previous.map((value, i) => (i === index ? { ...value, ...changes } : value))
                        );
                    }}
                />
            ))}
        </>
    );
}

it('independently edits each enrollment using a single credit checkbox', () => {
    render(<Enrollments />);
    screen.getAllByText('Enrollment settings').forEach((summary) => fireEvent.click(summary));
    const credit = screen.getAllByRole('checkbox', { name: 'Counts for credit' }) as HTMLInputElement[];
    expect(credit).toHaveLength(2);
    expect(credit.map((input) => input.checked)).toEqual([true, false]);
    fireEvent.click(credit[0]);
    expect(credit.map((input) => input.checked)).toEqual([false, false]);
    fireEvent.click(credit[1]);
    expect(credit.map((input) => input.checked)).toEqual([false, true]);
});

it('uses computed automatic eligibility, records an explicit yes, and allows resetting to course rules', () => {
    const onChange = jest.fn();
    const { rerender } = render(
        <EnrollmentStateControls state={{}} automaticCountsForCredit={false} onChange={onChange} />
    );
    fireEvent.click(screen.getByText('Enrollment settings'));
    const checkbox = screen.getByRole('checkbox', { name: 'Counts for credit' }) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(screen.getByText('Using course rules')).toBeTruthy();
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenLastCalledWith({ countsForCredit: true });
    rerender(
        <EnrollmentStateControls
            state={{ countsForCredit: true }}
            automaticCountsForCredit={false}
            onChange={onChange}
        />
    );
    expect(checkbox.checked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Use course rules' }));
    expect(onChange).toHaveBeenLastCalledWith({ countsForCredit: undefined });
    rerender(<EnrollmentStateControls state={{}} automaticCountsForCredit={false} onChange={onChange} />);
    expect(checkbox.checked).toBe(false);
    rerender(<EnrollmentStateControls state={{}} automaticCountsForCredit onChange={onChange} />);
    expect(checkbox.checked).toBe(true);
});
