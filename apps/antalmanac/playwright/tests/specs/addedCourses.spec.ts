import { expect } from '@playwright/test';

import { test } from '../fixtures';
import { verifyPastEnrollmentButton, verifyReviewsButton, verifyZotisticsButton } from '../utils/courseDataHelper';
import { verifyCourseInfoInCalendar } from '../utils/courseSearchHelper';
import { verifyScheduleCopied } from '../utils/scheduleHelper';

test.describe('Added course pane tests', () => {
    test.beforeEach(async ({ courseSearchPage, addedCoursesPage, courseRowPage }) => {
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await addedCoursesPage.goToAddedCourses();
    });

    test('added courses pane shows all added courses', async ({ addedCoursesPage, courseRowPage }) => {
        const courseRows = await addedCoursesPage.getAddedCourseRows();
        await expect(courseRows).toHaveCount(1);
        // Added classes row contains correct information
        const classRowInfo = courseRows.nth(0).locator('td');
        const courseRowInfoStr = await classRowInfo.allInnerTexts();
        expect(courseRowInfoStr).toContain(courseRowPage.getCourseCode());
        expect(courseRowInfoStr).toContain(courseRowPage.getCourseLoc());
        expect(courseRowInfoStr).toContain(courseRowPage.getCourseDayTime());
        // Added classes schedule matches current schedule
        const addedPane = await addedCoursesPage.getAddedPane();
        const title = addedPane.getByRole('heading').first();
        const currentSchedule = await addedCoursesPage.page.getByTestId('schedule-select-button').allInnerTexts();
        await expect(title).toHaveText(`${currentSchedule} (${courseRowPage.getCourseUnits()} Units)`);
    });

    test('copy schedule button in added courses pane', async ({
        addedCoursesPage,
        schedulePage,
        courseRowPage,
        calendarPage,
    }) => {
        await addedCoursesPage.addedCoursesCopySchedule(schedulePage);
        await verifyScheduleCopied(schedulePage, courseRowPage, calendarPage);
    });

    test('clear schedule button in added courses pane', async ({ addedCoursesPage, calendarPage }) => {
        await addedCoursesPage.addedCoursesClearSchedule();
        expect(await calendarPage.getCalendarEventCount()).toBe(0);
    });
    test('search button above added class redirects to search page', async ({
        addedCoursesPage,
        courseRowPage,
        calendarPage,
    }) => {
        await addedCoursesPage.addedCoursesSearchPage();
        await verifyCourseInfoInCalendar(calendarPage, courseRowPage);
    });
    test('added course data buttons open course data', async ({ courseDataPage }) => {
        await verifyZotisticsButton(courseDataPage);
        await courseDataPage.page.mouse.click(0, 0);
        await verifyPastEnrollmentButton(courseDataPage);
        await courseDataPage.page.mouse.click(0, 0);
        await verifyReviewsButton(courseDataPage);
    });
});
