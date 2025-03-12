import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { search } from '../config';

export class CalendarPopupPage {
    private courseCalendarPopup: Locator;
    private coursePopupRows: Locator;

    constructor(public readonly page: Page) {
        this.page = page;
        this.courseCalendarPopup = this.page.getByTestId('course-calendar-event');
        this.coursePopupRows = this.courseCalendarPopup.locator('tbody tr');
    }

    async verifyCalendarEventPopup() {
        // Ensure section exists in calendar view with correct code
        const calendarEvent = this.page.getByTestId('course-event').first();
        await expect(calendarEvent).toBeVisible();

        await calendarEvent.click();

        this.courseCalendarPopup = await this.page.getByTestId('course-calendar-event');
        await expect(this.courseCalendarPopup).toBeVisible();

        // Expect 6 rows of course information in popup
        this.coursePopupRows = await this.courseCalendarPopup.locator('tbody tr');
        await expect(this.coursePopupRows).toHaveCount(6);
    }

    async popupOpenClassLocation() {
        // Expect going to class location opens map
        const locationLink = await this.coursePopupRows.nth(3).locator('td div a');
        await locationLink.click();

        const mapPane = await this.page.getByTestId('map-pane');
        await expect(mapPane).toBeVisible();
        const mapPopup = await mapPane.locator('.leaflet-popup');
        await expect(mapPopup).toBeVisible();
    }

    async popupQuickSearch() {
        // Expect quick search button goes to course
        const quickSearchButton = await this.courseCalendarPopup.getByTitle('Quick Search');
        await expect(quickSearchButton).toBeVisible();
        await expect(quickSearchButton).toContainText(search.courseName);
        await quickSearchButton.click();
        const coursePane = await this.page.getByTestId('course-pane-box');
        await expect(coursePane).toBeVisible(); // Ensure course pane is shown
        const deptCard = await this.page.getByTestId('school-name');
        await expect(deptCard).toHaveText(search.school); // Ensure right school is displayed
    }

    async popupDeleteCourse() {
        // Delete course from calendar using popup
        const deleteButton = await this.courseCalendarPopup.getByTitle('Delete');
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();
    }
}
