import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { getEventFreq } from '../utils/helpers';

export class CourseRowPage {
    // Extracts and stores data about selected course
    private courseRow: Locator;
    private courseRowInfo: Locator;
    private courseDetails: {
        time: string;
        dayTime: string;
        location: string;
        code: string;
        units: string;
        frequency: number;
    };

    constructor(public readonly page: Page) {
        this.page = page;
        this.courseRow = this.page.getByTestId('class-table-row').nth(0);
        this.courseRowInfo = this.courseRow.locator('td');
        this.courseDetails = {
            time: '',
            dayTime: '',
            location: '',
            code: '',
            units: '',
            frequency: 0,
        };
    }

    async verifyCourseRowInfoCount() {
        this.courseRow = await this.page.getByTestId('class-table-row').nth(0);
        this.courseRowInfo = await this.courseRow.locator('td');
        await expect(this.courseRowInfo).toHaveCount(11);
    }

    async initCourseRowFreqTime() {
        const dayTime = await this.courseRowInfo.nth(5).allInnerTexts();
        const timeInfo = dayTime[0].split(' ');
        this.courseDetails.dayTime = dayTime[0]; // '[days] [time]'
        this.courseDetails.time = timeInfo.slice(1).join(' ');
        this.courseDetails.frequency = getEventFreq(timeInfo[0]);
    }

    async initCourseRowLoc() {
        this.courseDetails.location = (await this.courseRowInfo.nth(6).allInnerTexts()).join('');
    }

    async initCourseRowCode() {
        const courseCodeContainer = await this.page.locator("div[aria-label='Click to copy course code']").first();
        await expect(courseCodeContainer).toBeVisible();
        this.courseDetails.code = (await courseCodeContainer.allInnerTexts()).join('');
    }

    async initCourseRowUnits() {
        const courseType = await this.courseRowInfo.nth(2);
        const courseUnitRow = await courseType.locator('div').nth(2);
        const courseUnits = (await courseUnitRow.allInnerTexts()).join('');
        this.courseDetails.units = courseUnits.replace('Units: ', '');
    }

    async initCourseRow() {
        await this.verifyCourseRowInfoCount();
        await this.initCourseRowFreqTime();
        await this.initCourseRowLoc();
        await this.initCourseRowCode();
        await this.initCourseRowUnits();
    }

    async getCourseRow() {
        return this.courseRow;
    }

    getCourseTime() {
        return this.courseDetails.time;
    }

    getCourseDayTime() {
        return this.courseDetails.dayTime;
    }

    getCourseLoc() {
        return this.courseDetails.location;
    }

    getCourseCode() {
        return this.courseDetails.code;
    }

    getCourseUnits() {
        return this.courseDetails.units;
    }

    getCourseFreq() {
        return this.courseDetails.frequency;
    }
}
