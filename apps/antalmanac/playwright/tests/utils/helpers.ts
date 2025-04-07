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

export const getEventFreq = (classDays: string) => {
    const days = classDays.split(/(?=[A-Z])/); // split by uppercase letters
    return days.length;
};

export const closeStartPopups = async (page: Page) => {
    const patchNotes = page.getByTestId('patch-notes-close');
    if (await patchNotes.isVisible()) {
        await patchNotes.click();
    }
    await page.locator("button[aria-label='Close Tour']").click();
};

export const clickIconButton = async (locator: Locator | Page, iconName: string) => {
    const button = locator.getByTestId(iconName);
    await expect(button).toBeEnabled();
    await button.click();
};

export const clickTextButton = async (locator: Locator | Page, text: string) => {
    const textButton = await locator.getByRole('button', { name: text });
    await expect(textButton).toBeEnabled();
    await textButton.click();
};

export const inputDialog = async (page: Page, dialogName: string, input: string) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const heading = dialog.getByRole('heading');
    await expect(heading).toHaveText(dialogName);

    const inputBox = dialog.getByRole('textbox');
    await expect(inputBox).toBeVisible();
    await inputBox.fill(input);

    const enterButton = dialog.getByRole('button').nth(1);
    await expect(enterButton).toBeEnabled();
    await enterButton.click();
};

export const getNewTab = async (page: Page, action: () => Promise<void>) => {
    const [newTab] = await Promise.all([page.waitForEvent('popup', { timeout: 30000 }), action()]);
    await newTab.waitForLoadState();
    return newTab;
};
