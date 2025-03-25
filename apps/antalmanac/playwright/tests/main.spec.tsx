import { test as base, expect } from '@playwright/test';

import { AddedCoursesPage } from './test_pages/addedCoursesPage';
import { CalendarPopupPage } from './test_pages/calendarPopupPage';
import { CourseDataPage } from './test_pages/courseDataPage';
import { CourseRowPage } from './test_pages/courseRowPage';
import { CourseSearchPage } from './test_pages/courseSearchPage';
import { HeaderPage } from './test_pages/headerPage';
import { MapPage } from './test_pages/mapPage';
import { SchedulePage } from './test_pages/schedulePage';

const test = base.extend<{
    courseSearchPage: CourseSearchPage;
    schedulePage: SchedulePage;
    calendarPopupPage: CalendarPopupPage;
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
    calendarPopupPage: async ({ page }, use) => {
        const calendarPopupPage = new CalendarPopupPage(page);
        await use(calendarPopupPage);
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

test.describe('Home Page', () => {
    test('should have correct title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle('AntAlmanac - UCI Schedule Planner');
    });
});

test.describe('Search course and add to calendar', () => {
    test.beforeEach(async ({ courseSearchPage, courseRowPage }) => {
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
    });
    test('course row changes upon adding section', async ({ courseSearchPage }) => {
        await courseSearchPage.verifyCourseRowHighlighted();
    });
    test('added course has correct info in calendar', async ({ courseSearchPage, courseRowPage }) => {
        await courseSearchPage.verifyCalendarEventInfo(courseRowPage);
    });
    test('course data buttons', async ({ courseDataPage }) => {
        await courseDataPage.runCourseDataTests();
    });
});

test.describe('Calendar course popup', () => {
    test.beforeEach(async ({ courseSearchPage, calendarPopupPage }) => {
        await calendarPopupPage.page.goto('/');
        await courseSearchPage.setUp();
        await calendarPopupPage.verifyCalendarEventPopup();
    });
    test('popup class location opens on Map', async ({ calendarPopupPage }) => {
        await calendarPopupPage.popupOpenClassLocation();
    });
    test('popup quick search redirects to course page', async ({ calendarPopupPage }) => {
        await calendarPopupPage.popupQuickSearch();
    });
    test('popup deletes course from calendar', async ({ calendarPopupPage, schedulePage }) => {
        await calendarPopupPage.popupDeleteCourse();
        await schedulePage.verifyCalendarEventCount(0);
    });
});

test.describe.serial('Modify schedules', () => {
    test.beforeEach(async ({ courseSearchPage, schedulePage, courseRowPage }) => {
        await schedulePage.page.goto('/');
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await schedulePage.verifyScheduleLocators();
    });

    test('current schedule name is editable', async ({ schedulePage }) => {
        await schedulePage.editScheduleName();
    });

    test('add a new schedule', async ({ schedulePage }) => {
        await schedulePage.addSchedule();
    });

    test('change schedules', async ({ schedulePage, courseRowPage }) => {
        await schedulePage.editScheduleName();
        await schedulePage.addSchedule();
        await schedulePage.changeSchedule(courseRowPage);
    });

    test('copy schedules', async ({ schedulePage, courseRowPage }) => {
        await schedulePage.copySchedule(courseRowPage);
    });

    test('delete schedules', async ({ schedulePage }) => {
        await schedulePage.addSchedule();
        await schedulePage.deleteSchedule();
    });
});

test.describe('Schedule toolbar', () => {
    test.beforeEach(async ({ courseSearchPage }) => {
        await courseSearchPage.setUp();
    });

    test('toggle finals schedule', async ({ schedulePage }) => {
        await schedulePage.toggleFinals();
    });

    test('screenshot schedule prompts download', async ({ schedulePage }) => {
        await schedulePage.screenshotSchedule();
    });

    test('undo schedule action', async ({ schedulePage }) => {
        await schedulePage.undoScheduleAction();
    });
    test('clear schedule', async ({ schedulePage }) => {
        await schedulePage.clearSchedule();
    });
});

test.describe('added course pane', () => {
    test.beforeEach(async ({ courseSearchPage, addedCoursesPage, courseRowPage }) => {
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await addedCoursesPage.goToAddedCourses();
    });

    test('added courses pane shows all added courses', async ({
        addedCoursesPage,
        courseSearchPage,
        courseRowPage,
    }) => {
        await addedCoursesPage.verifyAddedCourses(courseRowPage);
        await courseSearchPage.verifyCalendarEventInfo(courseRowPage);
    });

    test('copy schedule button in added courses pane', async ({ addedCoursesPage, schedulePage, courseRowPage }) => {
        await addedCoursesPage.addedCoursesCopySchedule(schedulePage, courseRowPage);
    });

    test('clear schedule button in added courses pane', async ({ addedCoursesPage, schedulePage }) => {
        await addedCoursesPage.addedCoursesClearSchedule(schedulePage);
    });
    test('search button above added class redirects to search page', async ({
        addedCoursesPage,
        courseSearchPage,
        courseRowPage,
    }) => {
        await addedCoursesPage.addedCoursesSearchPage(courseSearchPage, courseRowPage);
    });
    test('added course data buttons', async ({ courseDataPage }) => {
        await courseDataPage.runCourseDataTests();
    });
});

test.describe('header actions', () => {
    test.beforeEach(async ({ courseSearchPage, headerPage, courseRowPage }) => {
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await headerPage.page.goto('/');
        await headerPage.initializeHeaderPage();
    });

    test('saves schedule, clears, and loads saved schedule in properly', async ({
        headerPage,
        schedulePage,
        courseRowPage,
    }) => {
        await headerPage.saveSchedule();
        await schedulePage.clearSchedule();
        await headerPage.loadSchedule(schedulePage, courseRowPage);
    });
});

test.describe('map', () => {
    test('Map shows course location marker and popup', async ({ mapPage, courseSearchPage, courseRowPage }) => {
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await mapPage.goToMapPage();
        await mapPage.verifyLocMarker();
        await mapPage.verifyCourseLocPopup(courseRowPage);
        await mapPage.verifyPopupDirections();
    });

    test('Searching for building shows location on map', async ({ mapPage }) => {
        await mapPage.setUp();
        await mapPage.searchMapLocation();
        await mapPage.verifyLocMarker();
        await mapPage.verifyLocPopup();
        await mapPage.verifyPopupDirections();
    });
});
