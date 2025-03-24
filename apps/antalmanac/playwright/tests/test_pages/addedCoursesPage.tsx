import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { search } from '../config';
import { clickIconButton } from '../testTools';

import { CoursePage } from './coursePage';
import { SchedulePage } from './schedulePage';

export class AddedCoursesPage {
    private addedPane: Locator;
    private addedActions: Locator;

    constructor(public readonly page: Page) {
        this.page = page;
        this.addedPane = this.page.getByTestId('course-pane-box');
        this.addedActions = this.page.getByTestId('added-course-actions');
    }

    async goToAddedCourses() {
        const addedTab = await this.page.locator('#added-courses-tab');
        await addedTab.click();
        this.addedPane = this.page.getByTestId('course-pane-box');
        this.addedActions = this.page.getByTestId('added-course-actions');
        await expect(this.addedPane).toBeVisible();
        await expect(this.addedActions).toBeVisible();
    }

    async verifyAddedCourses() {
        // matches current schedule
        const title = await this.addedPane.getByRole('heading').first();
        const currentSchedule = await this.page.getByTestId('schedule-select-button').allInnerTexts();
        await expect(title).toHaveText(`${currentSchedule} (${search.units} Units)`);

        // has added class
        const classRows = await this.addedPane.getByTestId('class-table-row');
        await expect(classRows).toHaveCount(1);
    }

    async addedCoursesCopySchedule(schedulePage: SchedulePage) {
        await clickIconButton(this.addedActions, 'ContentCopyIcon');
        await schedulePage.copyScheduleAction(true);
    }

    async addedCoursesClearSchedule(schedulePage: SchedulePage) {
        let dialogShown = false;
        this.page.on('dialog', async (alert) => {
            dialogShown = true;
            await alert.accept();
            await schedulePage.verifyCalendarEventCount(0);
        });
        await clickIconButton(this.addedActions, 'DeleteOutlineIcon');
        await expect(dialogShown).toBeTruthy();
    }

    async addedCoursesSearchPage(coursePage: CoursePage) {
        await clickIconButton(this.addedPane, 'SearchIcon');
        await coursePage.verifyCourseRowHighlighted();
        await coursePage.verifyCalendarEventInfo();
    }
}
