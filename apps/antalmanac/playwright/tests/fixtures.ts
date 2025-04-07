import { test as base } from '@playwright/test';

import { AddedCoursesPage } from './pages/addedCoursesPage';
import { CalendarPage } from './pages/calendarPage';
import { CourseDataPage } from './pages/courseDataPage';
import { CourseRowPage } from './pages/courseRowPage';
import { CourseSearchPage } from './pages/courseSearchPage';
import { HeaderPage } from './pages/headerPage';
import { MapPage } from './pages/mapPage';
import { SchedulePage } from './pages/schedulePage';

export const test = base.extend<{
    courseSearchPage: CourseSearchPage;
    schedulePage: SchedulePage;
    calendarPage: CalendarPage;
    addedCoursesPage: AddedCoursesPage;
    headerPage: HeaderPage;
    courseDataPage: CourseDataPage;
    courseRowPage: CourseRowPage;
    mapPage: MapPage;
}>({
    courseSearchPage: async ({ page }, use) => {
        const courseSearchPage = new CourseSearchPage(page);
        await use(courseSearchPage);
    },
    schedulePage: async ({ page }, use) => {
        const schedulePage = new SchedulePage(page);
        await use(schedulePage);
    },
    calendarPage: async ({ page }, use) => {
        const calendarPage = new CalendarPage(page);
        await use(calendarPage);
    },
    addedCoursesPage: async ({ page }, use) => {
        const addedCoursesPage = new AddedCoursesPage(page);
        await use(addedCoursesPage);
    },
    headerPage: async ({ page }, use) => {
        const headerPage = new HeaderPage(page);
        await use(headerPage);
    },
    courseDataPage: async ({ page }, use) => {
        const courseDataPage = new CourseDataPage(page);
        await use(courseDataPage);
    },
    courseRowPage: async ({ page }, use) => {
        const courseRowPage = new CourseRowPage(page);
        await use(courseRowPage);
    },
    mapPage: async ({ page }, use) => {
        const mapPage = new MapPage(page);
        await use(mapPage);
    },
});
