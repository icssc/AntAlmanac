import type { Page } from '@playwright/test';

import { clickTextButton, getNewTab } from '../utils/helpers';

export class CourseDataPage {
    constructor(public readonly page: Page) {
        this.page = page;
    }

    async openCourseReviews() {
        const action = async () => {
            await clickTextButton(this.page, 'Reviews');
        };

        const newTab = await getNewTab(this.page, action);
        return newTab;
    }

    async openZotistics() {
        await clickTextButton(this.page, 'Zotistics');
    }

    async openPastEnrollment() {
        await clickTextButton(this.page, 'Past Enrollment');
    }
}
