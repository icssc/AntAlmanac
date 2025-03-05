import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { schedule, search } from '../config';

export class SchedulePage {
    private scheduleButton: Locator;
    private schedulePopup: Locator;
    private scheduleRows: Locator;
    private calendarToolbar: Locator;

    constructor(public readonly page: Page) {
        this.page = page;
        this.scheduleButton = this.page.getByTestId('schedule-select-button');
        this.schedulePopup = this.page.getByTestId('schedule-popover');
        this.scheduleRows = this.schedulePopup.getByTestId('schedule-row');
        this.calendarToolbar = this.page.getByTestId('calendar-toolbar');
    }

    async inputDialog(dialogName: string, input: string) {
        const dialog = await this.page.getByRole('dialog');
        const heading = await dialog.getByRole('heading');
        await expect(heading).toHaveText(dialogName);

        const inputBox = await dialog.getByRole('textbox');
        await expect(inputBox).toBeVisible();
        await inputBox.fill(input);

        const enterButton = await dialog.getByRole('button').nth(1);
        await enterButton.click();
        // await this.page.keyboard.press('Enter');
    }

    async clickIconButton(locator: Locator, iconName: string) {
        const button = await locator.getByTestId(iconName);
        await expect(button).toBeVisible();
        await button.click();
    }

    async verifyScheduleLocators() {
        this.scheduleButton = await this.page.getByTestId('schedule-select-button');
        await expect(this.scheduleButton).toBeVisible();
        await this.scheduleButton.click();
        this.schedulePopup = await this.page.getByTestId('schedule-popover');
        await expect(this.schedulePopup).toBeVisible();
    }

    async verifyCalendarEventCount(event_count: number) {
        const calendarEventCount = await this.page.getByTestId('course-event').count();
        await expect(calendarEventCount).toBe(event_count);
    }

    async verifyCalendarCorrectCourse() {
        // Verify calendar shows courses in current schedule
        await this.verifyCalendarEventCount(search.classesPerWk);
        // Verify courses have same class name
        const firstCalendarEvent = await this.page.getByTestId('course-event').first();
        await expect(firstCalendarEvent).toContainText(search.courseName);
    }

    async editScheduleName() {
        await this.clickIconButton(this.schedulePopup, 'EditIcon');

        await this.inputDialog('Rename Schedule', schedule[0].name);

        // Ensure edited schedule name is saved
        await expect(this.scheduleButton).toContainText(schedule[0].name);
        await expect(await this.scheduleRows.nth(0)).toContainText(schedule[0].name);
    }

    async addScheduleAction() {
        // general add schedule action, can be used to test multiple copy buttons
        await this.inputDialog('Add Schedule', schedule[1].name);
        const schedulesCount = await this.scheduleRows.count();

        // Ensure schedule gets added
        await expect(schedulesCount).toBe(2);
        await expect(await this.scheduleRows.nth(1)).toContainText(schedule[1].name);

        // Ensure schedule switches to new schedule
        await expect(this.scheduleButton).toContainText(schedule[1].name);

        // Ensure new schedule is empty
        await this.verifyCalendarEventCount(0);
    }

    async addSchedule() {
        await this.clickIconButton(this.schedulePopup, 'AddIcon');
        await this.addScheduleAction();
    }

    async switchCurrentSchedule(name: string) {
        const switchScheduleButton = await this.scheduleRows.getByText(name);
        expect(switchScheduleButton).toBeVisible();
        await switchScheduleButton.click();
    }

    async changeSchedule() {
        await this.switchCurrentSchedule(schedule[0].name);
        // Schedule button text changes to changed schedule's name
        await expect(this.scheduleButton).toContainText(schedule[0].name);

        // Verify calendar shows correct courses
        await this.verifyCalendarCorrectCourse();
    }

    async copyScheduleAction(otherPage: boolean) {
        // general copy schedule action
        await this.inputDialog('Copy Schedule', schedule[1].name);

        if (otherPage) {
            await this.verifyScheduleLocators();
        }

        const schedulesCount = await this.scheduleRows.count();

        // Ensure schedule gets added
        await expect(schedulesCount).toBe(2);
        await expect(await this.scheduleRows.nth(1)).toContainText(schedule[1].name);

        // Switch to new schedule
        await this.switchCurrentSchedule(schedule[1].name);

        // Ensure new schedule has original schedules' courses
        await this.verifyCalendarCorrectCourse();
    }

    async copySchedule() {
        await this.clickIconButton(this.schedulePopup, 'ContentCopyIcon');
        await this.copyScheduleAction(false);
    }

    async toggleFinals() {
        await this.page.mouse.click(0, 0); // Dismiss schedule popover
        const finalsButton = await this.page.getByTestId('finals-button');

        await finalsButton.click();
        await this.verifyCalendarEventCount(1);
        const finalsEvent = await this.page.getByTestId('course-event');
        expect(finalsEvent).toContainText(search.courseName);
    }

    async deleteScheduleAction(otherPage: boolean) {
        // generic delete schedule action
        const scheduleCount = await this.scheduleRows.count();
        const dialog = await this.page.getByRole('dialog');
        const heading = await dialog.getByRole('heading');
        await expect(heading).toHaveText('Delete Schedule');
        const enterButton = await dialog.getByRole('button').nth(1);
        await enterButton.click();

        if (otherPage) {
            await this.verifyScheduleLocators();
        }

        await expect(await this.scheduleRows.count()).toBe(scheduleCount - 1);
        if (scheduleCount - 1 == 1) {
            // Ensure you can't delete if there's only 1 schedule
            const deleteButtonIconFirst = await this.page.getByTestId('ClearIcon');
            const deleteButton = await this.schedulePopup.getByRole('button').filter({ has: deleteButtonIconFirst });
            await expect(deleteButton).toBeDisabled();
        }
    }

    async deleteSchedule() {
        await this.clickIconButton(this.scheduleRows.nth(1), 'ClearIcon');
        await this.deleteScheduleAction(false);
    }

    async screenshotSchedule() {
        await this.clickIconButton(this.calendarToolbar, 'PanoramaIcon');
        const download = await this.page.waitForEvent('download');
        expect(download).toBeTruthy();
    }

    async undoScheduleAction() {
        await this.clickIconButton(this.calendarToolbar, 'UndoIcon');
        await this.verifyCalendarEventCount(0);
    }

    async clearSchedule() {
        await this.clickIconButton(this.calendarToolbar, 'DeleteOutlineIcon');
        await this.verifyCalendarEventCount(0);
    }
}
