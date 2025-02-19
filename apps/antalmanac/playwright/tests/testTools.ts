import type { Page } from '@playwright/test';

export const getCalendarEventTime = (classTimeArr: string[]) => {
    // Formats section time from class row to time shown in calendar events
    const classStartTime = classTimeArr[1];
    const classEndTime = classTimeArr[3];
    const classBeforeAfterNoon = classTimeArr[4];
    const classTime = `${classStartTime} ${classBeforeAfterNoon} - ${classEndTime} ${classBeforeAfterNoon}`;
    return classTime;
};

export const closePopups = async (page: Page) => {
    await page.getByTestId('patch-notes-close').click();
    await page.locator("button[aria-label='Close Tour']").click();
};
