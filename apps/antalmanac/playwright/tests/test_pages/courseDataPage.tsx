import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { search } from '../config';
import { clickTextButton, verifyNewTabUrl } from '../testTools';

export class CourseDataPage {
    constructor(public readonly page: Page) {
        this.page = page;
    }

    async runCourseDataTests() {
        await test.step('Clicking reviews button redirects to peterportal', async () => {
            await this.openCourseReviews();
        });
        await test.step('Clicking Zotistics opens grades popup', async () => {
            await this.openZotistics();
            await this.closeInfoPopup();
        });
        await test.step('Clicking past enrollment shows enrollment history popup', async () => {
            await this.openPastEnrollment();
            await this.closeInfoPopup();
        });
    }

    async openCourseReviews() {
        const courseNameWithoutSpace = search.courseName.split(' ').join('');
        const reviewsUrl = 'https://peterportal.org/course/' + courseNameWithoutSpace;

        const action = async () => {
            await clickTextButton(this.page, 'Reviews');
        };

        await verifyNewTabUrl(this.page, reviewsUrl, action);
    }

    async openZotistics() {
        await clickTextButton(this.page, 'Zotistics');
        const gradesPopup = await this.page.getByTestId('grades-popup');
        await expect(gradesPopup).toBeVisible();
    }

    async openPastEnrollment() {
        await clickTextButton(this.page, 'Past Enrollment');
        const enrollmentPopup = await this.page.getByTestId('enrollment-history-popup');
        await expect(enrollmentPopup).toBeVisible();
    }

    async closeInfoPopup() {
        await this.page.mouse.click(0, 0);
    }
}
