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

interface Course {
    department: string;
    courseNumber: string;
    title: string;
    sections: Section[];
}

interface Section {
    sectionCode: string;
    to: {
        status: string;
        restrictionCodes: string[];
    };
}

interface Changes {
    statusChanged: boolean;
    codesChanged: boolean;
}

async function main() {
    try {
        const subscriptions = await getSubscriptionSectionCodes();
        await Promise.all(
            Object.entries(subscriptions).map(async ([term, sectionCodes]) => {
                const [quarter, year] = term.split('-');
                const batches = await batchCourseCodes(sectionCodes as string[]);

                await Promise.all(
                    batches.map(async (batch: string[]) => {
                        const response: { data: { courses: Course[] } } = getUpdatedClassesDummy(quarter, year, batch);
                        // const response = await getUpdatedClasses(quarter, year, batch);

                        await Promise.all(
                            response.data.courses.map(async (course: Course) => {
                                const { department: deptCode, courseNumber, title: courseTitle } = course;

                                await Promise.all(
                                    course.sections.map(async (section: Section) => {
                                        const sectionCode = Number(section.sectionCode);
                                        const currentStatus = section.to.status;
                                        const currentCodes = section.to.restrictionCodes.join(',');

                                        const previousState = await getLastUpdatedStatus(year, quarter, sectionCode);
                                        const previousStatus = previousState?.[0]?.lastUpdated || null;
                                        const previousCodes = previousState?.[0]?.lastCodes || '';

                                        const changes: Changes = {
                                            statusChanged: previousStatus !== currentStatus,
                                            codesChanged: previousCodes !== currentCodes,
                                        };

                                        if (!changes.statusChanged && !changes.codesChanged) return;

                                        const users = await getUsers(
                                            quarter,
                                            year,
                                            sectionCode,
                                            currentStatus,
                                            changes.statusChanged,
                                            changes.codesChanged
                                        );

                                        // Run notification and status update in parallel if there are users
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
