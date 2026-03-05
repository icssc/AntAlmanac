import type {
    HourMinute,
    WebsocAPIResponse,
    WebsocCourse,
    WebsocSection,
    WebsocSectionMeeting,
} from '@packages/anteater-api-types';

import type { CourseDetails } from './helpers/notificationDispatch';
import { batchCourseCodes, sendNotification } from './helpers/notificationDispatch';
import {
    filterUsersToNotify,
    getLastUpdatedStatus,
    getSubscriptionSectionCodes,
    getSubscriptionsForSections,
    getUpdatedClasses,
    type SubscriptionWithUser,
    updateSubscriptionStatus,
} from './helpers/subscriptionData';

/**
 * Formats meeting time into a readable string like "3:30PM-4:50PM".
 */
function formatMeetingTime(meeting: WebsocSectionMeeting): string {
    if (meeting.timeIsTBA) {
        return 'TBA';
    }

    const formatTime = (time: HourMinute) => {
        const hour = time.hour % 12 || 12;
        const minute = time.minute.toString().padStart(2, '0');
        const period = time.hour >= 12 ? 'PM' : 'AM';
        return `${hour}:${minute}${period}`;
    };

    return `${formatTime(meeting.startTime)}-${formatTime(meeting.endTime)}`;
}

interface FlattenedSection {
    section: WebsocSection;
    course: WebsocCourse;
}

interface PreviousState {
    lastUpdatedStatus: WebsocSection['status'] | null;
    lastCodes: string | null;
}

/**
 * Processes a section of a course and sends notifications to users if and only if the status and/or restriction codes have changed.
 * Also updates the subscription status in the database to the most current status and restriction codes.
 */
async function processSection(
    section: WebsocSection,
    course: WebsocCourse,
    quarter: string,
    year: string,
    previousState: PreviousState | undefined,
    sectionSubscriptions: SubscriptionWithUser[]
) {
    const { sectionCode, instructors, meetings, status, restrictions, sectionType } = section;
    const instructor = instructors.join(', ');

    const previousStatus = previousState?.lastUpdatedStatus || null;
    const previousRestrictions = previousState?.lastCodes || '';

    const statusChanged = previousStatus !== status;
    const codesChanged = previousRestrictions !== restrictions;

    if (!statusChanged && !codesChanged) {
        console.log(
            `[SKIP] ${course.deptCode} ${course.courseNumber} ${sectionCode} - No changes (status: ${status}, codes: ${restrictions})`
        );
        return;
    }

    console.log(`[PROCESSING] ${course.deptCode} ${course.courseNumber} ${sectionCode} - ${course.courseTitle}`);
    console.log(
        `  Changes: status=${statusChanged ? `${previousStatus}→${status}` : 'none'}, codes=${codesChanged ? `${previousRestrictions}→${restrictions}` : 'none'}`
    );

    const users = filterUsersToNotify(sectionSubscriptions, status, statusChanged, codesChanged);

    const meeting = meetings[0];
    const courseDetails: CourseDetails = {
        sectionCode: sectionCode,
        instructor,
        days: meeting && !meeting.timeIsTBA ? meeting.days : 'TBA',
        hours: meeting ? formatMeetingTime(meeting) : 'TBA',
        currentStatus: status,
        restrictionCodes: restrictions,
        deptCode: course.deptCode,
        courseNumber: course.courseNumber,
        courseTitle: course.courseTitle,
        courseType: sectionType,
        quarter,
        year,
    };

    if (users && users.length > 0) {
        console.log(`  Notifying ${users.length} user(s) for ${course.deptCode} ${course.courseNumber} ${sectionCode}`);
        await sendNotification(courseDetails, users, statusChanged, codesChanged);
    } else {
        console.log(`  No users to notify for ${course.deptCode} ${course.courseNumber} ${sectionCode}`);
    }

    await updateSubscriptionStatus(year, quarter, sectionCode, status, restrictions);
}

/**
 * Processes a batch of section codes and sends notifications to users if the status and/or restriction codes have changed.
 */
async function processBatch(batch: string[], quarter: string, year: string) {
    console.log(`[BATCH] Processing ${batch.length} section codes for ${quarter} ${year}`);
    const response: WebsocAPIResponse = (await getUpdatedClasses(quarter, year, batch)) || { schools: [] };

    const flatSections: FlattenedSection[] = [];
    for (const school of response.schools || []) {
        for (const department of school.departments) {
            for (const course of department.courses) {
                for (const section of course.sections) {
                    flatSections.push({ section, course });
                }
            }
        }
    }

    const processedSectionCodes = new Set(flatSections.map((s) => s.section.sectionCode));
    const notProcessed = batch.filter((code) => !processedSectionCodes.has(code));
    if (notProcessed.length > 0) {
        console.log(`[BATCH] ${notProcessed.length} section codes not found in response`);
    }

    console.log(`[BATCH] Processing ${flatSections.length} sections from response`);

    const sectionCodes = flatSections.map((s) => s.section.sectionCode);

    // Batch fetch: get all previous statuses and all subscriptions in 2 queries
    const [previousStatuses, allSubscriptions] = await Promise.all([
        getLastUpdatedStatus(year, quarter, sectionCodes),
        getSubscriptionsForSections(year, quarter, sectionCodes),
    ]);

    for (const { section, course } of flatSections) {
        const previousState = previousStatuses.get(section.sectionCode);
        const sectionSubscriptions = allSubscriptions.get(section.sectionCode) || [];
        await processSection(section, course, quarter, year, previousState, sectionSubscriptions);
    }
}

/**
 * Scans the database for all subscriptions and sends notifications to users if the status and/or restriction codes have changed.
 */
export async function scanAndNotify() {
    try {
        console.log('[SCAN] Starting subscription scan...');
        const subscriptions = await getSubscriptionSectionCodes();
        if (!subscriptions) {
            console.log('[SCAN] No subscriptions found');
            return;
        }

        const termCounts = Object.entries(subscriptions).map(([term, sectionCodes]) => {
            const [quarter, year] = term.split('-');
            return { term, quarter, year, count: sectionCodes.length };
        });

        console.log(`[SCAN] Found subscriptions for ${termCounts.length} term(s):`);
        termCounts.forEach(({ term, count }) => {
            console.log(`  ${term}: ${count} section code(s)`);
        });

        await Promise.all(
            Object.entries(subscriptions).map(([term, sectionCodes]) => {
                const [quarter, year] = term.split('-');
                const batches = batchCourseCodes(sectionCodes.map(String));
                console.log(
                    `[SCAN] Processing ${term}: ${sectionCodes.length} sections in ${batches.length} batch(es)`
                );
                return Promise.all(batches.map((batch) => processBatch(batch, quarter, year)));
            })
        );

        console.log('[SCAN] All subscriptions processed!');
    } catch (error) {
        console.error(
            '[ERROR] Error in managing subscription:',
            error instanceof Error ? error.message : String(error)
        );
        throw error;
    }
}
