import { test as base, expect } from '@playwright/test';

import { closePopups } from './testTools';
import { AddedCoursesPage } from './test_pages/addedCoursesPage';
import { CalendarPopupPage } from './test_pages/calendarPopupPage';
import { CourseDataPage } from './test_pages/courseDataPage';
import { CoursePage } from './test_pages/coursePage';
import { CourseRowPage } from './test_pages/courseRowPage';
import { HeaderPage } from './test_pages/headerPage';
import { SchedulePage } from './test_pages/schedulePage';

const test = base.extend<{
    coursePage: CoursePage;
    schedulePage: SchedulePage;
    calendarPopupPage: CalendarPopupPage;
    addedCoursesPage: AddedCoursesPage;
    headerPage: HeaderPage;
    courseDataPage: CourseDataPage;
    courseRowPage: CourseRowPage;
}>({
    coursePage: async ({ page }, use) => {
        const coursePage = new CoursePage(page);
        await use(coursePage);
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
});

test.describe('Home Page', () => {
    test('should have correct title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle('AntAlmanac - UCI Schedule Planner');
    });
});

test.describe('Search course and add to calendar', () => {
    test.beforeEach(async ({ coursePage, courseRowPage }) => {
        await coursePage.page.goto('/');
        await closePopups(coursePage.page);
        await coursePage.searchForCourse();
        await coursePage.addCourseToCalendar();
        await courseRowPage.initCourseRow();
    });
    test('course row changes upon adding section', async ({ coursePage }) => {
        await coursePage.verifyCourseRowHighlighted();
    });
    test('added course has correct info in calendar', async ({ coursePage, courseRowPage }) => {
        await coursePage.verifyCalendarEventInfo(courseRowPage);
    });
    test('course data buttons', async ({ courseDataPage }) => {
        await courseDataPage.runCourseDataTests();
    });
    test('course row info', async ({ courseRowPage }) => {
        await courseRowPage.initCourseRow();
        console.log(courseRowPage.getCourseFreq());
    });
});

test.describe('Calendar course popup', () => {
    test.beforeEach(async ({ coursePage, calendarPopupPage }) => {
        await coursePage.page.goto('/');
        await calendarPopupPage.page.goto('/');
        // Closes initial popups
        await closePopups(coursePage.page);
        // Set up adding courses
        await coursePage.searchForCourse();
        await coursePage.addCourseToCalendar();
        // Set up popup
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

test.describe('Modify schedules', () => {
    test.beforeEach(async ({ coursePage, schedulePage }) => {
        await coursePage.page.goto('/');
        await schedulePage.page.goto('/');
        // Closes initial popups
        await closePopups(coursePage.page);
        // Set up adding courses
        await coursePage.searchForCourse();
        await coursePage.addCourseToCalendar();
        // Set up schedules
        await schedulePage.verifyScheduleLocators();
    });

    test('current schedule name is editable', async ({ schedulePage }) => {
        await schedulePage.editScheduleName();
    });

    test('add a new schedule', async ({ schedulePage }) => {
        await schedulePage.addSchedule();
    });

    test('change schedules', async ({ schedulePage }) => {
        await schedulePage.editScheduleName();
        await schedulePage.addSchedule();
        await schedulePage.changeSchedule();
    });

    test('copy schedules', async ({ schedulePage }) => {
        await schedulePage.copySchedule();
    });

    test('delete schedules', async ({ schedulePage }) => {
        await schedulePage.addSchedule();
        await schedulePage.deleteSchedule();
    });
});

test.describe('Schedule toolbar', () => {
    test.beforeEach(async ({ coursePage, schedulePage }) => {
        await coursePage.page.goto('/');
        await schedulePage.page.goto('/');
        // Closes initial popups
        await closePopups(coursePage.page);
        // Set up adding courses
        await coursePage.searchForCourse();
        await coursePage.addCourseToCalendar();
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
    test.beforeEach(async ({ coursePage, addedCoursesPage, courseRowPage }) => {
        await coursePage.page.goto('/');
        await addedCoursesPage.page.goto('/');
        // Closes initial popups
        await closePopups(coursePage.page);
        // Set up adding courses
        await coursePage.searchForCourse();
        await coursePage.addCourseToCalendar();
        await courseRowPage.initCourseRow();

        // set up added courses pane
        await addedCoursesPage.goToAddedCourses();
    });

    test('added courses pane shows all added courses', async ({ addedCoursesPage, coursePage, courseRowPage }) => {
        await addedCoursesPage.verifyAddedCourses(courseRowPage);
        await coursePage.verifyCalendarEventInfo(courseRowPage);
    });

    test('copy schedule button in added courses pane', async ({ addedCoursesPage, schedulePage }) => {
        await addedCoursesPage.addedCoursesCopySchedule(schedulePage);
    });

    test('clear schedule button in added courses pane', async ({ addedCoursesPage, schedulePage }) => {
        await addedCoursesPage.addedCoursesClearSchedule(schedulePage);
    });
    test('search button above added class redirects to search page', async ({
        addedCoursesPage,
        coursePage,
        courseRowPage,
    }) => {
        await addedCoursesPage.addedCoursesSearchPage(coursePage, courseRowPage);
    });
    test('added course data buttons', async ({ courseDataPage }) => {
        await courseDataPage.runCourseDataTests();
    });
});

test.describe('header actions', () => {
    test.beforeEach(async ({ coursePage, headerPage }) => {
        await coursePage.page.goto('/');
        await headerPage.page.goto('/');
        // Closes initial popups
        await closePopups(coursePage.page);
        // Set up adding courses
        await coursePage.searchForCourse();
        await coursePage.addCourseToCalendar();

        await headerPage.initializeHeaderPage();
    });

    test('saves schedule, clears, and loads saved schedule in properly', async ({ headerPage, schedulePage }) => {
        await headerPage.saveSchedule();
        await schedulePage.clearSchedule();
        await headerPage.loadSchedule(schedulePage);
    });
});
