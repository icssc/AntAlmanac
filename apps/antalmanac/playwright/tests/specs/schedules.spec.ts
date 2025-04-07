import { expect } from '@playwright/test';

import { test } from '../fixtures';
import { schedule, search } from '../testConfig';
import { verifyScheduleCopied } from '../utils/scheduleHelper';

test.describe('Modifying schedules tests', () => {
    test.beforeEach(async ({ courseSearchPage, schedulePage, courseRowPage }) => {
        await schedulePage.page.goto('/');
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await schedulePage.initScheduleLocators();
    });

    test('current schedule name is editable', async ({ schedulePage }) => {
        await schedulePage.editScheduleName();
        const scheduleButton = await schedulePage.getScheduleButton();
        const scheduleRows = await schedulePage.getScheduleRows();
        await expect(scheduleButton).toContainText(schedule[0].name);
        await expect(scheduleRows.nth(0)).toContainText(schedule[0].name);
    });

    test('add a new schedule', async ({ schedulePage, calendarPage }) => {
        await schedulePage.addSchedule();
        // Ensure schedule gets added
        const scheduleButton = await schedulePage.getScheduleButton();
        const scheduleRows = await schedulePage.getScheduleRows();
        await expect(scheduleRows).toHaveCount(2);
        await expect(scheduleRows.nth(1)).toContainText(schedule[1].name);

        // Ensure schedule switches to new schedule
        await expect(scheduleButton).toContainText(schedule[1].name);

        // Ensure new schedule is empty
        await expect(await calendarPage.getCalendarEventCount()).toBe(0);
    });

    test('change schedules', async ({ schedulePage, courseRowPage, calendarPage }) => {
        await schedulePage.editScheduleName();
        await schedulePage.addSchedule();
        await schedulePage.switchCurrentSchedule(schedule[0].name);

        const scheduleButton = await schedulePage.getScheduleButton();
        // Schedule button text changes to changed schedule's name
        await expect(scheduleButton).toContainText(schedule[0].name);
        // Verify calendar shows courses in current schedule
        expect(await calendarPage.getCalendarEventCount()).toBe(courseRowPage.getCourseFreq());
        // Verify courses have same class name
        const firstCalendarEvent = schedulePage.page.getByTestId('course-event').first();
        await expect(firstCalendarEvent).toContainText(search.courseName);
    });

    test('copy schedules', async ({ schedulePage, courseRowPage, calendarPage }) => {
        await schedulePage.copySchedule();
        await verifyScheduleCopied(schedulePage, courseRowPage, calendarPage);
    });

    test('delete schedules', async ({ schedulePage }) => {
        await schedulePage.addSchedule();
        const scheduleRows = await schedulePage.getScheduleRows();
        const scheduleCount = await scheduleRows.count();
        await schedulePage.deleteSchedule();

        await expect(await schedulePage.getScheduleRows()).toHaveCount(scheduleCount - 1);

        if (scheduleCount == 1) {
            // Ensure you can't delete if there's only 1 schedule
            const schedulePopup = await schedulePage.getSchedulePopup();
            const deleteButtonIconFirst = schedulePage.page.getByTestId('ClearIcon');
            const deleteButton = schedulePopup.getByRole('button').filter({ has: deleteButtonIconFirst });
            await expect(deleteButton).toBeDisabled();
        }
    });
});

test.describe('Schedule toolbar tests', () => {
    test.beforeEach(async ({ courseSearchPage, schedulePage, courseRowPage }) => {
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await schedulePage.initScheduleLocators();
        await schedulePage.page.mouse.click(0, 0); // exit schedule popup
    });

    test('toggle finals schedule', async ({ schedulePage }) => {
        await schedulePage.toggleFinals();
        const finalsEvent = schedulePage.page.getByTestId('course-event');
        await expect(finalsEvent).toContainText(search.courseName);
    });

    test('screenshot schedule prompts download', async ({ schedulePage }) => {
        const download = await schedulePage.screenshotSchedule();
        expect(download).toBeTruthy();
    });

    test('undo schedule action reverses course add', async ({ schedulePage, calendarPage }) => {
        await schedulePage.undoScheduleAction();
        expect(await calendarPage.getCalendarEventCount()).toBe(0);
    });
    test('clear schedule', async ({ schedulePage, calendarPage }) => {
        await schedulePage.clearSchedule();
        expect(await calendarPage.getCalendarEventCount()).toBe(0);
    });
});
