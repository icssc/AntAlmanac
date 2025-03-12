import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { user } from '../config';
import { inputDialog } from '../testTools';

import { SchedulePage } from './schedulePage';

export class HeaderPage {
    private headerActions: Locator;

    constructor(public readonly page: Page) {
        this.page = page;
        this.headerActions = this.page.getByTestId('header-actions');
    }

    async initializeHeaderPage() {
        this.headerActions = await this.page.getByTestId('header-actions');
        await expect(this.headerActions).toBeVisible();
    }

    async saveSchedule() {
        const saveButton = await this.headerActions.locator('#save-button');
        await expect(saveButton).toBeVisible();
        await saveButton.click();
        await inputDialog(this.page, 'Save', user.id);
    }

    async handleLoadDialog() {
        let dismissAlert = false;
        let acceptAlert = false;
        this.page.on('dialog', async (alert) => {
            if (!dismissAlert && alert.message() == 'You have unsaved changes. Would you like to load them?') {
                await alert.dismiss();
                dismissAlert = true;
            } else if (!acceptAlert) {
                console.log(acceptAlert);

                await alert.accept();
                acceptAlert = true;
                console.log(acceptAlert);
            }
        });
    }

    async loadSchedule(schedulePage: SchedulePage) {
        const loadButton = await this.headerActions.locator('#load-button');
        await loadButton.click();
        await inputDialog(this.page, 'Load', user.id);

        await this.handleLoadDialog();

        await schedulePage.verifyCalendarCorrectCourse();
    }
}
