import { expect } from '@playwright/test';

import { test } from '../fixtures';
import { verifyCourseInfoInCalendar } from '../utils/courseSearchHelper';

test.describe('Header actions tests', () => {
    test.beforeEach(async ({ courseSearchPage, headerPage, courseRowPage }) => {
        await headerPage.page.goto('/');
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await headerPage.initializeHeaderPage();
    });

    test('saves schedule, clears, and loads saved schedule in properly', async ({
        headerPage,
        schedulePage,
        courseRowPage,
        calendarPage,
    }) => {
        await headerPage.saveSchedule();

        await schedulePage.clearSchedule();
        await expect(await calendarPage.getCalendarEventCount()).toBe(0);

        await headerPage.loadSchedule();

        await verifyCourseInfoInCalendar(calendarPage, courseRowPage);
    });
});
