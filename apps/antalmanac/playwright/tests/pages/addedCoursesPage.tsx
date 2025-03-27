import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { clickIconButton } from '../utils/helpers';

import { SchedulePage } from './schedulePage';

export class AddedCoursesPage {
    private addedPane: Locator;
    private addedActions: Locator;

    constructor(public readonly page: Page) {
        this.page = page;
        this.addedPane = this.page.getByTestId('course-pane-box');
        this.addedActions = this.page.getByTestId('added-course-actions');
    }

    async getAddedPane() {
        return this.addedPane;
    }

    async getAddedActions() {
        return this.addedActions;
    }

    async goToAddedCourses() {
        const addedTab = await this.page.locator('#added-courses-tab');
        await addedTab.click();
        this.addedPane = this.page.getByTestId('course-pane-box');
        this.addedActions = this.page.getByTestId('added-course-actions');
        await expect(this.addedPane).toBeVisible();
        await expect(this.addedActions).toBeVisible();
    }

    async getAddedCourseRows() {
        const classRows = this.addedPane.getByTestId('class-table-row');
        return classRows;
    }

    async addedCoursesCopySchedule(schedulePage: SchedulePage) {
        await clickIconButton(this.addedActions, 'ContentCopyIcon');
        await schedulePage.copyScheduleAction(true);
    }

    async addedCoursesClearSchedule() {
        let dialogShown = false;
        this.page.on('dialog', async (alert) => {
            dialogShown = true;
            await alert.accept();
        });
        await clickIconButton(this.addedActions, 'DeleteOutlineIcon');
        await expect(dialogShown).toBeTruthy();
    }

    async addedCoursesSearchPage() {
        await clickIconButton(this.addedPane, 'SearchIcon');
    }
}
