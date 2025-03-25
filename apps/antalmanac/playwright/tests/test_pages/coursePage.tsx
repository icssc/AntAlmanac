import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { search } from '../config';
import { closePopups, getCalendarEventTime } from '../testTools';

import { CourseRowPage } from './courseRowPage';

export class CoursePage {
    constructor(public readonly page: Page) {
        this.page = page;
    }

    async setUp() {
        await this.page.goto('/');
        await closePopups(this.page);
        await this.searchForCourse();
        await this.addCourseToCalendar();
    }

    async searchForCourse() {
        const searchBar = await this.page.locator('#searchBar').getByLabel('Search');
        await searchBar.fill(search.courseName);

        const option = await this.page.locator('#fuzzy-search-popup');
        await expect(option).toBeVisible();
        await this.page.keyboard.press('Enter');

        const deptCard = await this.page.getByTestId('school-name');
        await expect(deptCard).toHaveText(search.school);
    }

    async addCourseToCalendar() {
        const addIcon = await this.page.getByTestId('AddIcon').nth(1);
        await addIcon.click();
    }

    async verifyCourseRowHighlighted() {
        const classRow = await this.page.getByTestId('class-table-row').nth(0);
        await expect(classRow).toBeVisible();
        await expect(classRow).toHaveCSS('background-color', 'rgb(252, 252, 151)');
    }

    async deleteCourseFromCalendar() {
        const deleteButton = await this.page.getByTestId('class-table-row').nth(0).getByTestId('DeleteIcon');
        await deleteButton.click();
    }

    async verifyCalendarEventInfo(courseRowPage: CourseRowPage) {
        const calendarEventTime = await this.page.locator('.rbc-event-label').first();
        const calendarEvent = await this.page.getByTestId('course-event').first();
        const time = getCalendarEventTime(courseRowPage.getCourseDayTime().split(' '));

        await expect(calendarEvent).toBeVisible();
        await expect(calendarEvent).toContainText(search.courseName);
        await expect(calendarEvent).toContainText(courseRowPage.getCourseCode());
        await expect(calendarEvent).toContainText(courseRowPage.getCourseLoc());
        await expect(calendarEventTime).toContainText(time);
    }
}
