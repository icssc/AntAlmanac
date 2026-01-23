/*
 * To run this script, use 'pnpm run aants'
 */

import { WebsocResponse, WebsocSection, WebsocCourse, WebsocSchool, WebsocDepartment } from '@icssc/libwebsoc-next';

import {
    getUpdatedClasses,
    getSubscriptionSectionCodes,
    updateSubscriptionStatus,
    getLastUpdatedStatus,
    getUsers,
} from './helpers/subscriptionData';

import { batchCourseCodes, sendNotification, CourseDetails } from './helpers/notificationDispatch';

/**
 * Processes a section of a course and sends notifications to users if and only if the status and/or restriction codes have changed.
 * Also updates the subscription status in the database to the most current status and restriction codes.
 * @param section - The section of the course to process.
 * @param course - The course containing the section.
 * @param quarter - The academic quarter of the course.
 * @param year - The academic year of the course.
 */
async function processSection(section: WebsocSection, course: WebsocCourse, quarter: string, year: string) {
    const { sectionCode, instructors, meetings, status, restrictions } = section;
    const instructor = instructors.join(', ');

    const previousState = await getLastUpdatedStatus(year, quarter, sectionCode);
    const previousStatus = previousState?.lastUpdatedStatus || null;
    const previousRestrictions = previousState?.lastCodes || '';

    const statusChanged = previousStatus !== status;
    const codesChanged = previousRestrictions !== restrictions;

    if (!statusChanged && !codesChanged) return;

    const users = await getUsers(quarter, year, sectionCode, status, statusChanged, codesChanged);

    const courseDetails: CourseDetails = {
        sectionCode: sectionCode,
        instructor,
        days: meetings[0].days,
        hours: meetings[0].time,
        currentStatus: status,
        restrictionCodes: restrictions,
        deptCode: course.deptCode,
        courseNumber: course.courseNumber,
        courseTitle: course.courseTitle,
        quarter,
        year,
    };

    if (users && users.length > 0) {
        await sendNotification(courseDetails, users, statusChanged, codesChanged);
    }

    await updateSubscriptionStatus(year, quarter, sectionCode, status, restrictions);
}

/**
 * Processes a course and sends notifications to users if the status and/or restriction codes have changed.
 * @param course - The course to process.
 * @param quarter - The academic quarter of the course.
 * @param year - The academic year of the course.
 */
function processCourse(course: WebsocCourse, quarter: string, year: string) {
    return Promise.all(course.sections.map((section) => processSection(section, course, quarter, year)));
}

/**
 * Processes a department and sends notifications to users if the status and/or restriction codes have changed.
 * @param department - The department to process.
 * @param quarter - The academic quarter of the department.
 * @param year - The academic year of the department.
 */
function processDepartment(department: WebsocDepartment, quarter: string, year: string) {
    return Promise.all(department.courses.map((course) => processCourse(course, quarter, year)));
}

/**
 * Processes a school and sends notifications to users if the status and/or restriction codes have changed.
 * @param school - The school to process.
 * @param quarter - The academic quarter of the school.
 * @param year - The academic year of the school.
 */
function processSchool(school: WebsocSchool, quarter: string, year: string) {
    return Promise.all(school.departments.map((department) => processDepartment(department, quarter, year)));
}

/**
 * Processes a batch of section codes and sends notifications to users if the status and/or restriction codes have changed.
 * @param batch - The batch of section codes to process.
 * @param quarter - The academic quarter of the batch.
 * @param year - The academic year of the batch.
 */
async function processBatch(batch: string[], quarter: string, year: string) {
    const response: WebsocResponse = (await getUpdatedClasses(quarter, year, batch)) || { schools: [] };
    return Promise.all(response.schools.map((school) => processSchool(school, quarter, year)));
}

/**
 * Scans the database for all subscriptions and sends notifications to users if the status and/or restriction codes have changed.
 */
export async function scanAndNotify() {
    try {
        const subscriptions = await getSubscriptionSectionCodes();
        if (!subscriptions) return;

        await Promise.all(
            Object.entries(subscriptions).map(([term, sectionCodes]) => {
                const [quarter, year] = term.split('-');
                const batches = batchCourseCodes(sectionCodes.map(String));
                return Promise.all(batches.map((batch) => processBatch(batch, quarter, year)));
            })
        );

        console.log('All subscriptions sent!');
    } catch (error) {
        console.error('Error in managing subscription:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
