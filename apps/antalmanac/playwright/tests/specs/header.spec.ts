import { expect } from '@playwright/test';

import { test } from '../fixtures';
import { verifyCourseInfoInCalendar } from '../utils/courseSearchHelper';
import { getSnackbar } from '../utils/helpers';

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
        expect(await calendarPage.getCalendarEventCount()).toBe(0);

        await headerPage.loadSchedule();
        const snackbar = await getSnackbar(headerPage.page);
        await expect(snackbar).toHaveText(/loaded/i);

        await verifyCourseInfoInCalendar(calendarPage, courseRowPage);
    });
});
