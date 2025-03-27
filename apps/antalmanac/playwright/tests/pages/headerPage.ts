import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { user } from '../testConfig';
import { inputDialog } from '../utils/helpers';

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
        await saveButton.click();
        await inputDialog(this.page, 'Save', user.id);
    }

    async loadSchedule() {
        const handledAlerts = new Set<string>();

        this.page.on('dialog', async (alert) => {
            if (!handledAlerts.has(alert.message())) {
                if (alert.message() == 'You have unsaved changes. Would you like to load them?') {
                    await alert.dismiss();
                }
                handledAlerts.add(alert.message());
            }
        });

        const loadButton = await this.headerActions.locator('#load-button');
        await loadButton.click();
        await inputDialog(this.page, 'Load', user.id);
    }
}
