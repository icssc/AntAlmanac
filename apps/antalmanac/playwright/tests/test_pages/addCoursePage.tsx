import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { search } from '../config';
import { getCalendarEventTime } from '../testTools';

export class AddCoursePage {
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
        const calendarEventCount = await this.page.getByTestId('course-event').count();
        await expect(calendarEventCount).toBe(0);
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

    async verifyCalendarEventPopup() {
        // Ensure section exists in calendar view with correct code
        const calendarEvent = this.page.getByTestId('course-event').first();
        await expect(calendarEvent).toBeVisible();

        await calendarEvent.click();

        const courseCalendarPopup = await this.page.getByTestId('course-calendar-event');
        await expect(courseCalendarPopup).toBeVisible();

        // Expect 6 rows of course information in popup
        const rowLocator = courseCalendarPopup.locator('tbody tr');
        const rowCount = await rowLocator.count();
        await expect(rowCount).toBe(6);

        // Expect going to class location opens map
        const locationLink = await rowLocator.nth(3).locator('td div a');
        await locationLink.click();

        const mapPane = await this.page.getByTestId('map-pane');
        await expect(mapPane).toBeVisible();
        const mapPopup = await mapPane.locator('.leaflet-popup');
        await expect(mapPopup).toBeVisible();

        // Expect quick search button goes to course
        const quickSearchButton = await courseCalendarPopup.getByTitle('Quick Search');
        await expect(quickSearchButton).toBeVisible();
        quickSearchButton.click();
        const coursePane = await this.page.getByTestId('course-pane-box');
        await expect(coursePane).toBeVisible(); // Ensure course pane is shown
        const deptCard = this.page.getByTestId('school-name');
        await expect(deptCard).toHaveText(search.school); // Ensure right school is displayed

        // Change color?

        // Delete course from calendar
        const deleteButton = await courseCalendarPopup.getByTitle('Delete');
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();
        const calendarEventCount = await this.page.getByTestId('course-event').count();
        await expect(calendarEventCount).toBe(0);
    }
}
