/*
 * To run this script, use 'pnpm run aants'
 */

import {
    getUpdatedClassesDummy,
    getSubscriptionSectionCodes,
    updateSubscriptionStatus,
    getLastUpdatedStatus,
    batchCourseCodes,
    getUsers,
    sendNotification,
} from './helpers/helpers';

async function main() {
    try {
        const subscriptions = await getSubscriptionSectionCodes();
        await Promise.all(
            Object.entries(subscriptions).map(async ([term, sectionCodes]) => {
                const [quarter, year] = term.split('-');
                const batches = await batchCourseCodes(sectionCodes as string[]);

                await Promise.all(
                    batches.map(async (batch) => {
                        const response = getUpdatedClassesDummy(quarter, year, batch);
                        // const response = await getUpdatedClasses(quarter, year, batch);

                        await Promise.all(
                            response.data.courses.map(async (course) => {
                                const { deptCode, courseNumber, courseTitle } = course;

                                await Promise.all(
                                    course.sections.map(async (section) => {
                                        const sectionCode = Number(section.sectionCode);
                                        const currentStatus = section.status;
                                        const currentCodes = section.restrictions;

                                        const previousState = await getLastUpdatedStatus(year, quarter, sectionCode);
                                        const previousStatus = previousState?.[0]?.lastUpdated || null;
                                        const previousCodes = previousState?.[0]?.lastCodes || '';

                                        const statusChanged = previousStatus !== currentStatus;
                                        const codesChanged = previousCodes !== currentCodes;

                                        if (!statusChanged && !codesChanged) return;

                                        const users = await getUsers(
                                            quarter,
                                            year,
                                            sectionCode,
                                            currentStatus,
                                            statusChanged,
                                            codesChanged
                                        );

                                        if (users && users.length > 0) {
                                            await sendNotification(
                                                year,
                                                quarter,
                                                sectionCode,
                                                currentStatus,
                                                currentCodes,
                                                deptCode,
                                                courseNumber,
                                                courseTitle,
                                                users,
                                                changes.statusChanged,
                                                changes.codesChanged
                                            );
                                        }
                                        await updateSubscriptionStatus(
                                            year,
                                            quarter,
                                            sectionCode,
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
    } catch (error) {
        console.error('Error in managing subscription:', error instanceof Error ? error.message : String(error));
    } finally {
        process.exit(0);
    }
}

main();
