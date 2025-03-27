import { expect } from '@playwright/test';

import { CalendarPage } from '../pages/calendarPage';
import { CourseRowPage } from '../pages/courseRowPage';
import { SchedulePage } from '../pages/schedulePage';
import { schedule, search } from '../testConfig';

export const verifyScheduleCopied = async (
    schedulePage: SchedulePage,
    courseRowPage: CourseRowPage,
    calendarPage: CalendarPage
) => {
    const scheduleRows = await schedulePage.getScheduleRows();
    // Ensure schedule gets added
    await expect(scheduleRows).toHaveCount(2);
    await expect(await scheduleRows.nth(1)).toContainText(schedule[1].name);
    // Verify calendar shows courses in current schedule
    await expect(await calendarPage.getCalendarEventCount()).toBe(courseRowPage.getCourseFreq());
    // Verify courses have same class name
    const firstCalendarEvent = await schedulePage.page.getByTestId('course-event').first();
    await expect(firstCalendarEvent).toContainText(search.courseName);
};
