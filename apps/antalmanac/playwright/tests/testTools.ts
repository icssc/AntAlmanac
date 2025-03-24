import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

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

export const clickIconButton = async (locator: Locator | Page, iconName: string) => {
    const button = await locator.getByTestId(iconName);
    await expect(button).toBeVisible();
    await button.click();
};

export const clickTextButton = async (locator: Locator | Page, text: string) => {
    const textButton = await locator.getByRole('button').getByText(text);
    await textButton.click();
};

export const inputDialog = async (page: Page, dialogName: string, input: string) => {
    const dialog = await page.getByRole('dialog');
    const heading = await dialog.getByRole('heading');
    await expect(heading).toHaveText(dialogName);

    const inputBox = await dialog.getByRole('textbox');
    await expect(inputBox).toBeVisible();
    await inputBox.fill(input);

    const enterButton = await dialog.getByRole('button').nth(1);
    await enterButton.click();
};

export const verifyNewTabUrl = async (page: Page, url: string, action: () => Promise<void>) => {
    const newTabPromise = page.waitForEvent('popup');

    await action();

    const newTab = await newTabPromise;
    await newTab.waitForLoadState();
    await expect(newTab).toHaveURL(url);
};
