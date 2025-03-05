import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { search } from '../config';
import { getCalendarEventTime } from '../testTools';

export class CoursePage {
    constructor(public readonly page: Page) {
        this.page = page;
    }

    async searchForCourse() {
        const searchBar = await this.page.locator('#searchBar').getByLabel('Search');
        await expect(searchBar).toBeVisible();
        await searchBar.fill(search.courseName);

        const option = await this.page.locator('#fuzzy-search-popup');
        await expect(option).toBeInViewport();
        await this.page.keyboard.press('Enter');

        const deptCard = this.page.getByTestId('school-name');
        await expect(deptCard).toHaveText(search.school);
    }

    async addCourseToCalendar() {
        const addIcon = this.page.getByTestId('AddIcon').nth(1);
        await addIcon.click();
    }

    async verifyCourseRowHighlighted() {
        const classRow = await this.page.getByTestId('class-table-row').nth(0);
        await expect(classRow).toBeVisible();
        await expect(classRow).toHaveCSS('background-color', 'rgb(252, 252, 151)');
    }

    async deleteCourseFromCalendar() {
        const deleteButton = await this.page.getByTestId('class-table-row').nth(0).getByTestId('DeleteIcon');
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();
    }

    async verifyCalendarEventInfo() {
        const classRow = await this.page.getByTestId('class-table-row').nth(0);
        const classRowInfo = await classRow.locator('td');
        await expect(await classRowInfo.count()).toBe(11);

        const classDayTime = await classRowInfo.nth(5).allInnerTexts();
        const classTime = getCalendarEventTime(classDayTime[0].split(' '));

        const calendarEventTime = await this.page.locator('.rbc-event-label').first();

        const place = await classRowInfo.nth(6).allInnerTexts();

        // Fetch course code of first result
        const courseCodeContainer = await this.page.locator("div[aria-label='Click to copy course code']").first();
        await expect(courseCodeContainer).toBeVisible();
        const courseCode = await courseCodeContainer.allInnerTexts();

        const calendarEvent = this.page.getByTestId('course-event').first();
        await expect(calendarEvent).toBeVisible();
        await expect(calendarEvent).toContainText(search.courseName);
        await expect(calendarEvent).toContainText(courseCode);
        await expect(calendarEvent).toContainText(place);
        await expect(calendarEventTime).toContainText(classTime);
    }
}
