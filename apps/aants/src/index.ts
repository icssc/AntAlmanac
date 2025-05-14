/*
 * To run this script, use 'pnpm run aants'
 */

import { WebsocResponse } from '@icssc/libwebsoc-next';

import {
    getUpdatedClasses,
    getSubscriptionSectionCodes,
    updateSubscriptionStatus,
    getLastUpdatedStatus,
    batchCourseCodes,
    getUsers,
    sendNotification,
} from './helpers/helpers';

export async function scanAndNotify() {
    try {
        const subscriptions = await getSubscriptionSectionCodes();
        await Promise.all(
            Object.entries(subscriptions).map(async ([term, sectionCodes]) => {
                const [quarter, year] = term.split('-');
                const batches = await batchCourseCodes(sectionCodes as string[]);

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
                                                    course.sections.map(async (section) => {
                                                        const {
                                                            sectionCode,
                                                            instructors,
                                                            meetings,
                                                            status,
                                                            restrictions,
                                                        } = section;
                                                        const instructor = instructors.join(', ');
                                                        const currentStatus = section.status;
                                                        const currentCodes = section.restrictions;

                                                        const previousState = await getLastUpdatedStatus(
                                                            year,
                                                            quarter,
                                                            Number(sectionCode)
                                                        );
                                                        const previousStatus = previousState?.[0]?.lastUpdated || null;
                                                        const previousCodes = previousState?.[0]?.lastCodes || '';

                                                        const statusChanged = previousStatus !== currentStatus;
                                                        const codesChanged = previousCodes !== currentCodes;

                                                        if (!statusChanged && !codesChanged) return;

                                                        const users = await getUsers(
                                                            quarter,
                                                            year,
                                                            Number(sectionCode),
                                                            currentStatus,
                                                            statusChanged,
                                                            codesChanged
                                                        );

                                                        if (users && users.length > 0) {
                                                            await sendNotification(
                                                                Number(sectionCode),
                                                                instructor,
                                                                meetings[0].days,
                                                                meetings[0].time,
                                                                status,
                                                                restrictions,
                                                                deptCode,
                                                                courseNumber,
                                                                courseTitle,
                                                                users,
                                                                statusChanged,
                                                                codesChanged,
                                                                quarter,
                                                                year
                                                            );
                                                        }
                                                        await updateSubscriptionStatus(
                                                            year,
                                                            quarter,
                                                            Number(sectionCode),
                                                            currentStatus,
                                                            currentCodes
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
    } catch (error) {
        console.error('Error in managing subscription:', error instanceof Error ? error.message : String(error));
    } finally {
        process.exit(0);
    }
}
