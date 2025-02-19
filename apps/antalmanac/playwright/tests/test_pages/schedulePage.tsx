import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { schedule } from '../config';

export class SchedulePage {
    private scheduleButton: Locator;
    private schedulePopup: Locator;

    constructor(public readonly page: Page) {
        this.page = page;
        this.scheduleButton = this.page.getByTestId('schedule-select-button');
        this.schedulePopup = this.page.getByTestId('schedule-popover');
    }

    async verifyScheduleLocators() {
        await expect(this.scheduleButton).toBeVisible();
        await this.scheduleButton.click();
        this.schedulePopup = await this.page.getByTestId('schedule-popover');
        await expect(this.schedulePopup).toBeVisible();
    }

    async editScheduleName() {
        const editButton = await this.page.getByTestId('EditIcon');
        await editButton.click();

        const editDialog = await this.page.getByRole('dialog');
        console.log(editDialog.allInnerTexts());

        await expect(await editDialog.getByRole('heading')).toHaveText('Rename Schedule');

        const nameInput = await editDialog.getByRole('textbox');
        await nameInput.fill(schedule[0].name);
        await this.page.keyboard.press('Enter');

        // Ensure edited schedule name is saved
        await expect(this.scheduleButton).toContainText(schedule[0].name);
        await expect(this.schedulePopup).toContainText(schedule[0].name);
    }
}
