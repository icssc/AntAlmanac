import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { search } from '../testConfig';

export class CalendarPage {
    private courseCalendarPopup: Locator;
    private coursePopupRows: Locator;

    constructor(public readonly page: Page) {
        this.courseCalendarPopup = this.page.getByTestId('course-calendar-event');
        this.coursePopupRows = this.courseCalendarPopup.locator('tbody tr');
    }

    async getCalendarEvent() {
        const calendarEvent = this.page.getByTestId('course-event').first();
        return calendarEvent;
    }

    async getCalendarEventTime() {
        const calendarEventTime = this.page.locator('.rbc-event-label').first();
        return calendarEventTime;
    }

    async getCalendarEventCount() {
        const calendarEvent = this.page.getByTestId('course-event');
        return await calendarEvent.count();
    }

    async initCalendarEventPopup() {
        // Ensure section exists in calendar view with correct code
        const calendarEvent = this.page.getByTestId('course-event').first();
        await calendarEvent.click();

        await expect(this.courseCalendarPopup).toBeVisible();

        // Expect 6 rows of course information in popup
        await expect(this.coursePopupRows).toHaveCount(6);
    }

    async popupOpenClassLocation() {
        // Expect going to class location opens map
        const locationLink = this.coursePopupRows.nth(3).locator('td div a');
        await locationLink.click();
    }

    async popupQuickSearch() {
        // Expect quick search button goes to course
        const quickSearchButton = this.courseCalendarPopup.getByTitle('Quick Search');
        await expect(quickSearchButton).toBeVisible();
        await expect(quickSearchButton).toContainText(search.courseName);
        await quickSearchButton.click();
    }

    async popupDeleteCourse() {
        // Delete course from calendar using popup
        const deleteButton = this.courseCalendarPopup.getByTitle('Delete');
        await deleteButton.click();
    }
}
