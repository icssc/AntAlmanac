/*
 * To run this script, use 'pnpm run aants'
 */

import { WebsocResponse, WebsocSection } from '@icssc/libwebsoc-next';

import {
    getUpdatedClasses,
    getSubscriptionSectionCodes,
    updateSubscriptionStatus,
    getLastUpdatedStatus,
    getUsers,
} from './helpers/subscriptionData';

import { batchCourseCodes, sendNotification, CourseDetails } from './helpers/notificationDispatch';

export async function scanAndNotify() {
    try {
        const subscriptions = await getSubscriptionSectionCodes();
        if (!subscriptions) return;
        await Promise.all(
            Object.entries(subscriptions).map(async ([term, sectionCodes]) => {
                const [quarter, year] = term.split('-');
                const batches = batchCourseCodes(sectionCodes.map(String));

                await Promise.all(
                    batches.map(async (batch) => {
                        const response: WebsocResponse = (await getUpdatedClasses(quarter, year, batch)) || {
                            schools: [],
                        };
                        await Promise.all(
                            response?.schools?.map(async (school) => {
                                await Promise.all(
                                    school.departments.map(async (department) => {
                                        await Promise.all(
                                            department.courses.map(async (course) => {
                                                const { deptCode, courseNumber, courseTitle } = course;

                                                await Promise.all(
                                                    course.sections.map(async (section: WebsocSection) => {
                                                        const {
                                                            sectionCode,
                                                            instructors,
                                                            meetings,
                                                            status,
                                                            restrictions,
                                                        } = section;
                                                        const instructor = instructors.join(', ');
                                                        // const currentStatus = section.status;
                                                        // const currentCodes = section.restrictions;

                                                        const previousState = await getLastUpdatedStatus(
                                                            year,
                                                            quarter,
                                                            Number(sectionCode)
                                                        );
                                                        const previousStatus = previousState?.[0]?.lastUpdated || null;
                                                        const previousRestrictions =
                                                            previousState?.[0]?.lastCodes || '';

                                                        const statusChanged = previousStatus !== status;
                                                        const codesChanged = previousRestrictions !== restrictions;

                                                        if (!statusChanged && !codesChanged) return;

                                                        const users = await getUsers(
                                                            quarter,
                                                            year,
                                                            Number(sectionCode),
                                                            status,
                                                            statusChanged,
                                                            codesChanged
                                                        );

                                                        const courseDetails: CourseDetails = {
                                                            sectionCode: Number(sectionCode),
                                                            instructor,
                                                            days: meetings[0].days,
                                                            hours: meetings[0].time,
                                                            currentStatus: status,
                                                            restrictionCodes: restrictions,
                                                            deptCode,
                                                            courseNumber,
                                                            courseTitle,
                                                            quarter,
                                                            year,
                                                        };

                                                        if (users && users.length > 0) {
                                                            await sendNotification(
                                                                courseDetails,
                                                                users,
                                                                statusChanged,
                                                                codesChanged
                                                            );
                                                        }
                                                        await updateSubscriptionStatus(
                                                            year,
                                                            quarter,
                                                            Number(sectionCode),
                                                            status,
                                                            restrictions
                                                        );
                                                    })
                                                );
                                            })
                                        );
                                    })
                                );
                            })
                        );
                    })
                );
            })
        );
        console.log('All subscriptions sent!');
    } catch (error) {
        console.error('Error in managing subscription:', error instanceof Error ? error.message : String(error));
    } finally {
        process.exit(0);
    }
}
