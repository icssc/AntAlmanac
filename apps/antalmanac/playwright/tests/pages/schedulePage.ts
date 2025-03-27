import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { schedule } from '../testConfig';
import { clickIconButton, inputDialog } from '../utils/helpers';

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

    async getScheduleButton() {
        return this.scheduleButton;
    }

    async getSchedulePopup() {
        return this.schedulePopup;
    }

    async getScheduleRows() {
        return this.scheduleRows;
    }

    async initScheduleLocators() {
        this.scheduleButton = await this.page.getByTestId('schedule-select-button');
        await expect(this.scheduleButton).toBeVisible();
        await this.scheduleButton.click();
        this.schedulePopup = await this.page.getByTestId('schedule-popover');
        await expect(this.schedulePopup).toBeVisible();
    }

    async editScheduleName() {
        await clickIconButton(this.schedulePopup, 'EditIcon');
        await inputDialog(this.page, 'Rename Schedule', schedule[0].name);
    }

    async addSchedule() {
        await clickIconButton(this.schedulePopup, 'AddIcon');
        await inputDialog(this.page, 'Add Schedule', schedule[1].name);
    }

    async switchCurrentSchedule(name: string) {
        const switchScheduleButton = await this.scheduleRows.getByText(name);
        await switchScheduleButton.click();
    }

    async copyScheduleAction(otherPage: boolean) {
        // general copy schedule action
        await inputDialog(this.page, 'Copy Schedule', schedule[1].name);

        if (otherPage) {
            await this.initScheduleLocators();
        }

        // Switch to new schedule
        await this.switchCurrentSchedule(schedule[1].name);
    }

    async copySchedule() {
        await clickIconButton(this.schedulePopup, 'ContentCopyIcon');
        await this.copyScheduleAction(false);
    }

    async toggleFinals() {
        const finalsButton = await this.page.getByTestId('finals-button');
        await finalsButton.click();
    }

    async deleteScheduleAction(otherPage: boolean) {
        // generic delete schedule action
        const dialog = await this.page.getByRole('dialog');
        const heading = await dialog.getByRole('heading');
        await expect(heading).toHaveText('Delete Schedule');
        const enterButton = await dialog.getByRole('button').nth(1);
        await enterButton.click();

        if (otherPage) {
            await this.initScheduleLocators();
        }
    }

    async deleteSchedule() {
        await clickIconButton(this.scheduleRows.nth(1), 'ClearIcon');
        await this.deleteScheduleAction(false);
    }

    async screenshotSchedule() {
        await clickIconButton(this.calendarToolbar, 'PanoramaIcon');
        const download = this.page.waitForEvent('download');
        return download;
    }

    async undoScheduleAction() {
        await clickIconButton(this.calendarToolbar, 'UndoIcon');
    }

    async clearSchedule() {
        this.page.on('dialog', async (alert) => {
            await alert.accept();
        });
        await clickIconButton(this.calendarToolbar, 'DeleteOutlineIcon');
    }
}
