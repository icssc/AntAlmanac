import { CourseRenamedBanner } from '$components/RightPane/CoursePane/CourseRenderPane/CourseRenamedBanner';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { setDeptValue, setCourseNumber } = vi.hoisted(() => ({
    setDeptValue: vi.fn(),
    setCourseNumber: vi.fn(),
}));

vi.mock('$components/RightPane/CoursePane/SearchParams/hooks', () => ({
    useCourseSearchParam: (field: string) => {
        if (field === 'courseIds') return [[], vi.fn()];
        if (field === 'deptValue') return ['I&C SCI', setDeptValue];
        return ['32A', setCourseNumber];
    },
}));

vi.mock('$components/RightPane/CoursePane/SearchParams/defaults', () => ({
    DEFAULT_MANUAL_SEARCH_VALUES: { deptValue: 'ALL' },
}));

describe('CourseRenamedBanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('shows the I&C SCI 32A rename and selects I&C SCI H32 when clicked', () => {
        render(<CourseRenamedBanner deptValue="I&C SCI" courseNumber="32A" />);

        const banner = screen.getByRole('button');
        expect(banner.textContent).toContain('I&C SCI 32A was renamed.');
        expect(banner.textContent).toContain('I&C SCI H32');

        fireEvent.click(banner);

        expect(setDeptValue).toHaveBeenCalledWith('I&C SCI');
        expect(setCourseNumber).toHaveBeenCalledWith('H32');
    });
});
