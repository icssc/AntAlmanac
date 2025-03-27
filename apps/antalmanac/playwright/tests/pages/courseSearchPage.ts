import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { search } from '../testConfig';
import { verifySearchLoaded } from '../utils/courseSearchHelper';
import { closeStartPopups } from '../utils/helpers';

export class CourseSearchPage {
    constructor(public readonly page: Page) {
        this.page = page;
    }

    async setUp() {
        await this.page.goto('/');
        await closeStartPopups(this.page);
        await this.searchForCourse();
        await verifySearchLoaded(this);
        await this.addCourseToCalendar();
    }

    async searchForCourse() {
        const searchBar = await this.page.locator('#fuzzy-search');
        await searchBar.waitFor();
        await searchBar.fill(search.courseName);

        const searchOptions = await this.page.locator('#fuzzy-search-popup');
        await searchOptions.waitFor();
        await expect(searchOptions).toBeVisible();
        const option = await searchOptions.getByRole('option').nth(0);
        await option.click();
    }

    async addCourseToCalendar() {
        const addIcon = await this.page.getByTestId('AddIcon').nth(1);
        await addIcon.waitFor();
        await expect(addIcon).toBeEnabled();
        await addIcon.click();
    }

    async deleteCourseFromCalendar() {
        const deleteButton = await this.page.getByTestId('class-table-row').nth(0).getByTestId('DeleteIcon');
        await deleteButton.click();
    }
}
