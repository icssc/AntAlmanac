import { expect } from '@playwright/test';

import { test } from '../fixtures';
import { verifyPastEnrollmentButton, verifyReviewsButton, verifyZotisticsButton } from '../utils/courseDataHelper';
import { verifyCourseInfoInCalendar } from '../utils/courseSearchHelper';

test.describe('Search course page tests', () => {
    test.beforeEach(async ({ courseSearchPage, courseRowPage }) => {
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
    });
    test('course row changes color upon adding section', async ({ courseRowPage }) => {
        const row = await courseRowPage.getCourseRow();
        await expect(row).toHaveCSS('background-color', 'rgb(252, 252, 151)');
    });
    test('added course has correct info in calendar', async ({ calendarPage, courseRowPage }) => {
        await verifyCourseInfoInCalendar(calendarPage, courseRowPage);
    });
    test('Zotistics button shows course grades', async ({ courseDataPage }) => {
        await verifyZotisticsButton(courseDataPage);
    });
    test('Past enrollment button shows course enrollment history', async ({ courseDataPage }) => {
        await verifyPastEnrollmentButton(courseDataPage);
    });
    test('Clicking reviews button redirects to peterportal', async ({ courseDataPage }) => {
        await verifyReviewsButton(courseDataPage);
    });
});
