import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { schedule, search } from '../config';
import { clickIconButton, inputDialog } from '../testTools';

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

    async verifyScheduleLocators() {
        this.scheduleButton = await this.page.getByTestId('schedule-select-button');
        await expect(this.scheduleButton).toBeVisible();
        await this.scheduleButton.click();
        this.schedulePopup = await this.page.getByTestId('schedule-popover');
        await expect(this.schedulePopup).toBeVisible();
    }

    async verifyCalendarEventCount(event_count: number) {
        const calendarEvent = await this.page.getByTestId('course-event');
        await expect(calendarEvent).toHaveCount(event_count);
    }

    async verifyCalendarCorrectCourse() {
        // Verify calendar shows courses in current schedule
        await this.verifyCalendarEventCount(search.classesPerWk);
        // Verify courses have same class name
        const firstCalendarEvent = await this.page.getByTestId('course-event').first();
        await expect(firstCalendarEvent).toContainText(search.courseName);
    }

    async editScheduleName() {
        await clickIconButton(this.schedulePopup, 'EditIcon');

        await inputDialog(this.page, 'Rename Schedule', schedule[0].name);

        // Ensure edited schedule name is saved
        await expect(this.scheduleButton).toContainText(schedule[0].name);
        await expect(await this.scheduleRows.nth(0)).toContainText(schedule[0].name);
    }

    async addScheduleAction() {
        // general add schedule action, can be used to test multiple copy buttons
        await inputDialog(this.page, 'Add Schedule', schedule[1].name);

        // Ensure schedule gets added
        await expect(this.scheduleRows).toHaveCount(2);
        await expect(await this.scheduleRows.nth(1)).toContainText(schedule[1].name);

        // Ensure schedule switches to new schedule
        await expect(this.scheduleButton).toContainText(schedule[1].name);

        // Ensure new schedule is empty
        await this.verifyCalendarEventCount(0);
    }

    async addSchedule() {
        await clickIconButton(this.schedulePopup, 'AddIcon');
        await this.addScheduleAction();
    }

    async switchCurrentSchedule(name: string) {
        const switchScheduleButton = await this.scheduleRows.getByText(name);
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
        await inputDialog(this.page, 'Copy Schedule', schedule[1].name);

        if (otherPage) {
            await this.verifyScheduleLocators();
        }

        // Ensure schedule gets added
        await expect(this.scheduleRows).toHaveCount(2);
        await expect(await this.scheduleRows.nth(1)).toContainText(schedule[1].name);

        // Switch to new schedule
        await this.switchCurrentSchedule(schedule[1].name);

        // Ensure new schedule has original schedules' courses
        await this.verifyCalendarCorrectCourse();
    }

    async copySchedule() {
        await clickIconButton(this.schedulePopup, 'ContentCopyIcon');
        await this.copyScheduleAction(false);
    }

    async toggleFinals() {
        await this.page.mouse.click(0, 0); // Dismiss schedule popover

        const finalsButton = await this.page.getByTestId('finals-button');
        await finalsButton.click();

        await this.verifyCalendarEventCount(1);
        const finalsEvent = await this.page.getByTestId('course-event');
        await expect(finalsEvent).toContainText(search.courseName);
    }

    async verifyHiddenDeleteButton(scheduleCount: number) {
        if (scheduleCount == 1) {
            // Ensure you can't delete if there's only 1 schedule
            const deleteButtonIconFirst = await this.page.getByTestId('ClearIcon');
            const deleteButton = await this.schedulePopup.getByRole('button').filter({ has: deleteButtonIconFirst });
            await expect(deleteButton).toBeDisabled();
        }
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

        await expect(await this.scheduleRows).toHaveCount(scheduleCount - 1);
        await this.verifyHiddenDeleteButton(scheduleCount - 1);
    }

    async deleteSchedule() {
        await clickIconButton(this.scheduleRows.nth(1), 'ClearIcon');
        await this.deleteScheduleAction(false);
    }

    async screenshotSchedule() {
        await clickIconButton(this.calendarToolbar, 'PanoramaIcon');
        const download = await this.page.waitForEvent('download');
        await expect(download).toBeTruthy();
    }

    async undoScheduleAction() {
        await clickIconButton(this.calendarToolbar, 'UndoIcon');
        await this.verifyCalendarEventCount(0);
    }

    async clearSchedule() {
        this.page.on('dialog', async (alert) => {
            await alert.accept();
        });
        await clickIconButton(this.calendarToolbar, 'DeleteOutlineIcon');
        await this.verifyCalendarEventCount(0);
    }
}
