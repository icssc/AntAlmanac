import { openSnackbar } from './actions/AppStoreActions';
import { PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT } from './api/endpoints';

export async function getCoursesData(userData) {
    const dataToSend = {};
    const addedCourses = [];

    let sectionCodeToInfoMapping;
    if (userData.addedCourses.length !== 0) {
        sectionCodeToInfoMapping = userData.addedCourses.reduce((accumulator, addedCourse) => {
            accumulator[addedCourse.sectionCode] = { ...addedCourse };
            return accumulator;
        }, {});
    }

    for (let i = 0; i < userData.addedCourses.length; ++i) {
        const addedCourse = userData.addedCourses[i];
        const sectionsOfTermArray = dataToSend[addedCourse.term];

        if (sectionsOfTermArray !== undefined) {
            const lastSectionArray = sectionsOfTermArray[sectionsOfTermArray.length - 1];
            if (lastSectionArray.length === 10) sectionsOfTermArray.push([addedCourse.sectionCode]);
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

            const response = await queryWebsoc(params);
            const jsonResp = await response.json();

            for (const school of jsonResp.schools) {
                for (const department of school.departments) {
                    for (const course of department.courses) {
                        for (const section of course.sections) {
                            addedCourses.push({
                                ...sectionCodeToInfoMapping[section.sectionCode],
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

    return {
        addedCourses: addedCourses,
        customEvents: userData.customEvents,
    };
}

export async function queryWebsoc(params) {
    // Construct a request to PeterPortal with the params as a query string
    const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url);

    if (response.ok || response.status === 400) {
        // Return the PeterPortal API response if the status is ok
        // or if the status is 400 (means the paramaters were invalid)
        return response;
    } else {
        // If the PeterPortal API is down,
        // attempt to use the former AntAlamanc websoc endpoint
        const backupResponse = await fetch(WEBSOC_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        return backupResponse;
    }
}

export function clickToCopy(event, sectionCode) {
    event.stopPropagation();

    let tempEventTarget = document.createElement('input');
    document.body.appendChild(tempEventTarget);
    tempEventTarget.setAttribute('value', sectionCode);
    tempEventTarget.select();
    document.execCommand('copy');
    document.body.removeChild(tempEventTarget);
    openSnackbar('success', 'Section code copied to clipboard');
}
