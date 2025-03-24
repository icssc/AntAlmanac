import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { getEventFreq } from '../testTools';

export class CourseRowPage {
    private courseRow: Locator;
    private courseRowInfo: Locator;
    private courseTime: string;
    private courseDayTime: string;
    private courseLoc: string;
    private courseCode: string;
    private courseUnits: string;
    private courseFreq: number;

    constructor(public readonly page: Page) {
        this.page = page;
        this.courseRow = this.page.getByTestId('class-table-row').nth(0);
        this.courseRowInfo = this.courseRow.locator('td');
        this.courseTime = '';
        this.courseDayTime = '';
        this.courseLoc = '';
        this.courseCode = '';
        this.courseUnits = '';
        this.courseFreq = 0;
    }

    async verifyCourseRowInfoCount() {
        this.courseRow = await this.page.getByTestId('class-table-row').nth(0);
        this.courseRow = await this.courseRow.locator('td');
        await expect(this.courseRowInfo).toHaveCount(11);
    }

    async initCourseRowFreqTime() {
        const dayTime = await this.courseRowInfo.nth(5).allInnerTexts();
        const timeInfo = dayTime[0].split(' ');
        this.courseDayTime = dayTime[0]; // '[days] [time]'
        this.courseTime = timeInfo.slice(1).join(' ');
        this.courseFreq = getEventFreq(timeInfo[0]);
    }

    async initCourseRowLoc() {
        this.courseLoc = (await this.courseRowInfo.nth(6).allInnerTexts()).join('');
    }

    async initCourseRowCode() {
        const courseCodeContainer = await this.page.locator("div[aria-label='Click to copy course code']").first();
        await expect(courseCodeContainer).toBeVisible();
        this.courseCode = (await courseCodeContainer.allInnerTexts()).join('');
    }

    async initCourseRowUnits() {
        const courseType = await this.courseRowInfo.nth(2);
        const courseUnitRow = await courseType.locator('div').nth(2);
        const courseUnits = (await courseUnitRow.allInnerTexts()).join('');
        this.courseUnits = courseUnits.replace('Units: ', '');
    }

    async initCourseRow() {
        await this.verifyCourseRowInfoCount();
        await this.initCourseRowFreqTime();
        await this.initCourseRowLoc();
        await this.initCourseRowCode();
        await this.initCourseRowUnits();
    }

    getCourseTime() {
        return this.courseTime;
    }

    getCourseDayTime() {
        return this.courseDayTime;
    }

    getCourseLoc() {
        return this.courseLoc;
    }

    getCourseCode() {
        return this.courseCode;
    }

    getCourseUnits() {
        return this.courseUnits;
    }

    getCourseFreq() {
        return this.courseFreq;
    }
}
