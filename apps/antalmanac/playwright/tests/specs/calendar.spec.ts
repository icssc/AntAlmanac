import { expect } from '@playwright/test';

import { test } from '../fixtures';

test.describe('Calendar course popup', () => {
    test.beforeEach(async ({ courseSearchPage, calendarPage }) => {
        await courseSearchPage.setUp();
        await calendarPage.initCalendarEventPopup();
    });
    test('popup class location opens on Map', async ({ calendarPage }) => {
        await calendarPage.popupOpenClassLocation();
        const mapPane = await calendarPage.page.getByTestId('map-pane');
        await expect(mapPane).toBeVisible();
        const mapPopup = await mapPane.locator('.leaflet-popup');
        await expect(mapPopup).toBeVisible();
    });
    test('popup quick search redirects to course page', async ({ calendarPage }) => {
        await calendarPage.popupQuickSearch();
        const coursePane = await calendarPage.page.getByTestId('course-pane-box');
        await expect(coursePane).toBeVisible(); // Ensure course pane is shown
    });
    test('popup deletes course from calendar', async ({ calendarPage }) => {
        await calendarPage.popupDeleteCourse();
        const eventCount = await calendarPage.getCalendarEventCount();
        await expect(eventCount).toBe(0);
    });
});
