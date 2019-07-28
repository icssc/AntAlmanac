export async function getCoursesData(userData) {
    const dataToSend = {};
    const addedCourses = [];
    const sectionCodeToInfoMapping = userData.addedCourses.reduce(
        (accumulator, addedCourse) => {
            accumulator[addedCourse.sectionCode] = { ...addedCourse };
            return accumulator;
        },
        {}
    );

    for (let i = 0; i < userData.addedCourses.length; ++i) {
        const addedCourse = userData.addedCourses[i];
        const sectionsOfTermArray = dataToSend[addedCourse.term];

        if (sectionsOfTermArray !== undefined) {
            const lastSectionArray =
                sectionsOfTermArray[sectionsOfTermArray.length - 1];
            if (lastSectionArray.length === 10)
                sectionsOfTermArray.push([addedCourse.sectionCode]);
            else lastSectionArray.push(addedCourse.sectionCode);
        } else {
            dataToSend[addedCourse.term] = [[addedCourse.sectionCode]];
        }
    }
    //TODO: Cancelled classes?

    for (const [term, sectionsOfTermArray] of Object.entries(dataToSend)) {
        for (const sectionArray of sectionsOfTermArray) {
            const params = {
                term: term,
                sectionCodes: sectionArray.join(','),
            };

            const response = await fetch('/api/websocapi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            const jsonResp = await response.json();

            for (const school of jsonResp.schools) {
                for (const department of school.departments) {
                    for (const course of department.courses) {
                        for (const section of course.sections) {
                            addedCourses.push({
                                ...sectionCodeToInfoMapping[
                                    section.sectionCode
                                ],
                                deptCode: department.deptCode,
                                courseNumber: course.courseNumber,
                                courseTitle: course.courseTitle,
                                courseComment: course.courseComment,
                                prerequisiteLink: course.prerequisiteLink,
                                section: section,
                            });
                        }
                    }
                }
            }
        }
    }

    let customEvents = userData.customEvents;

    for (let customEvent of customEvents) {
        customEvent.start = new Date(customEvent.start);
        customEvent.end = new Date(customEvent.end);
    }

    return {
        addedCourses: addedCourses,
        customEvents: customEvents,
    };
}
