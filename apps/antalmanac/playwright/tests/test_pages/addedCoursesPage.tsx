import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { clickIconButton } from '../testTools';

import { CoursePage } from './coursePage';
import { CourseRowPage } from './courseRowPage';
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

    async verifyAddedCourseRows(courseRowPage: CourseRowPage) {
        // has added class
        const classRows = await this.addedPane.getByTestId('class-table-row');
        await expect(classRows).toHaveCount(1);

        const classRowInfo = await classRows.nth(0).locator('td');
        const classRowInfoStr = await classRowInfo.allInnerTexts();
        await expect(classRowInfoStr).toContain(courseRowPage.getCourseCode());
        await expect(classRowInfoStr).toContain(courseRowPage.getCourseLoc());
        await expect(classRowInfoStr).toContain(courseRowPage.getCourseDayTime());
    }

    async verifyAddedCourses(courseRowPage: CourseRowPage) {
        // matches current schedule
        const title = await this.addedPane.getByRole('heading').first();
        const currentSchedule = await this.page.getByTestId('schedule-select-button').allInnerTexts();
        await expect(title).toHaveText(`${currentSchedule} (${courseRowPage.getCourseUnits()} Units)`);
        await this.verifyAddedCourseRows(courseRowPage);
    }

    async addedCoursesCopySchedule(schedulePage: SchedulePage, courseRowPage: CourseRowPage) {
        await clickIconButton(this.addedActions, 'ContentCopyIcon');
        await schedulePage.copyScheduleAction(true, courseRowPage);
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

    async addedCoursesSearchPage(coursePage: CoursePage, courseRowPage: CourseRowPage) {
        await clickIconButton(this.addedPane, 'SearchIcon');
        await coursePage.verifyCourseRowHighlighted();
        await coursePage.verifyCalendarEventInfo(courseRowPage);
    }
}
