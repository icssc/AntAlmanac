import { expect } from '@playwright/test';

import { CalendarPage } from '../pages/calendarPage';
import { CourseRowPage } from '../pages/courseRowPage';
import { CourseSearchPage } from '../pages/courseSearchPage';
import { search } from '../testConfig';

import { getCalendarEventTime } from './helpers';

export const verifyCourseInfoInCalendar = async (calendarPage: CalendarPage, courseRowPage: CourseRowPage) => {
    const time = getCalendarEventTime(courseRowPage.getCourseDayTime().split(' '));
    const calendarEvent = await calendarPage.getCalendarEvent();
    const calendarEventTime = await calendarPage.getCalendarEventTime();
    await expect(calendarEvent).toBeVisible();
    await expect(calendarEvent).toContainText(search.courseName);
    await expect(calendarEvent).toContainText(courseRowPage.getCourseCode());
    await expect(calendarEvent).toContainText(courseRowPage.getCourseLoc());
    await expect(calendarEventTime).toContainText(time);
};

export const verifySearchLoaded = async (courseSearchPage: CourseSearchPage) => {
    const schoolName = courseSearchPage.page.getByTestId('school-name');
    await schoolName.waitFor();
    await expect(schoolName).toBeVisible();
};
