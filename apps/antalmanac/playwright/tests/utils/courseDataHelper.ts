import { expect } from '@playwright/test';

import { CourseDataPage } from '../pages/courseDataPage';
import { search } from '../testConfig';

export const verifyZotisticsButton = async (courseDataPage: CourseDataPage) => {
    await courseDataPage.openZotistics();
    const gradesPopup = courseDataPage.page.getByTestId('grades-popup');
    await expect(gradesPopup).toBeVisible();
};

export const verifyPastEnrollmentButton = async (courseDataPage: CourseDataPage) => {
    await courseDataPage.openPastEnrollment();
    const enrollmentPopup = courseDataPage.page.getByTestId('enrollment-history-popup');
    await expect(enrollmentPopup).toBeVisible();
};

export const verifyReviewsButton = async (courseDataPage: CourseDataPage) => {
    const courseNameWithoutSpace = search.courseName.split(' ').join('');
    const reviewsUrl = 'https://peterportal.org/course/' + courseNameWithoutSpace;
    const newTab = await courseDataPage.openCourseReviews();
    expect(newTab).toBeDefined();
    await expect(newTab).toHaveURL(reviewsUrl);
    await newTab.close();
};
