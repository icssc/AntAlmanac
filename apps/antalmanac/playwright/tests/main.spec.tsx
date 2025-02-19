import { test as base, expect } from '@playwright/test';

import { closePopups } from './testTools';
import { AddCoursePage } from './test_pages/addCoursePage';
import { SchedulePage } from './test_pages/schedulePage';

const test = base.extend<{ addCoursePage: AddCoursePage; schedulePage: SchedulePage }>({
    addCoursePage: async ({ page }, use) => {
        const addCoursePage = new AddCoursePage(page);
        await use(addCoursePage);
    },
    schedulePage: async ({ page }, use) => {
        const schedulePage = new SchedulePage(page);
        await use(schedulePage);
    },
});

test.describe('Home Page', () => {
    test('should have correct title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle('AntAlmanac - UCI Schedule Planner');
    });
});

test.describe('Search course and add to calendar', () => {
    test.beforeEach(async ({ addCoursePage }) => {
        await addCoursePage.page.goto('/');
        await closePopups(addCoursePage.page);
        await addCoursePage.searchForCourse();
        await addCoursePage.addCourseToCalendar();
    });
    test('course row changes upon adding section', async ({ addCoursePage }) => {
        await addCoursePage.verifyCourseRowHighlighted();
        await addCoursePage.deleteCourseFromCalendar();
    });
    test('added course has correct info in calendar', async ({ addCoursePage }) => {
        await addCoursePage.verifyCalendarEventInfo();
    });
    test('course calendar event popup shows course info', async ({ addCoursePage }) => {
        await addCoursePage.verifyCalendarEventPopup();
    });
});

test.describe('Modify schedules', () => {
    test.beforeEach(async ({ addCoursePage, schedulePage }) => {
        await addCoursePage.page.goto('/');
        await schedulePage.page.goto('/');
        // Closes initial popups
        await closePopups(addCoursePage.page);
        // Set up adding courses
        await addCoursePage.searchForCourse();
        await addCoursePage.addCourseToCalendar();
        // Set up schedules
        await schedulePage.verifyScheduleLocators();
    });

    test('current schedule name is editable', async ({ schedulePage }) => {
        await schedulePage.editScheduleName();
    });
});
