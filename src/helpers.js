import { addCourse, openSnackbar } from './actions/AppStoreActions';
import { PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT } from './api/endpoints';
import AppStore from './stores/AppStore';

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

            const jsonResp = await queryWebsoc(params);

            for (const [sectionCode, courseData] of Object.entries(getCourseInfo(jsonResp))) {
                addedCourses.push({
                    ...sectionCodeToInfoMapping[sectionCode],
                    ...courseData.courseDetails,
                    section: courseData.section,
                });
            }
        }
    }
    return {
        addedCourses: addedCourses,
        customEvents: userData.customEvents,
    };
}

export function getCourseInfo(SOCObject) {
    let courseInfo = {};
    for (const school of SOCObject.schools) {
        for (const department of school.departments) {
            for (const course of department.courses) {
                for (const section of course.sections) {
                    courseInfo[section.sectionCode] = {
                        courseDetails: {
                            deptCode: department.deptCode,
                            courseNumber: course.courseNumber,
                            courseTitle: course.courseTitle,
                            courseComment: course.courseComment,
                            prerequisiteLink: course.prerequisiteLink,
                        },
                        section: section,
                    };
                }
            }
        }
    }
    return courseInfo;
}

const websocCache = {};

export function clearCache() {
    Object.keys(websocCache).forEach((key) => delete websocCache[key]); //https://stackoverflow.com/a/19316873/14587004
}

export async function queryWebsoc(params) {
    // Construct a request to PeterPortal with the params as a query string
    const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT);
    const searchString = new URLSearchParams(params).toString();
    if (websocCache[searchString]?.timestamp > Date.now() - 30 * 60 * 1000) {
        //if cache hit and less than 30 minutes old
        return websocCache[searchString];
    }
    url.search = searchString;
    try {
        const response = await fetch(url).then((r) => r.json());
        websocCache[searchString] = response;
        return response;
    } catch {
        const backupResponse = await fetch(WEBSOC_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        }).then((res) => res.json());
        websocCache[searchString] = backupResponse;
        return backupResponse;
    } finally {
        websocCache[searchString].timestamp = Date.now();
    }
}

export function combineSOCObjects(SOCObjects) {
    let combined = SOCObjects.shift();
    for (const res of SOCObjects) {
        for (const school of res.schools) {
            let schoolIndex = combined.schools.findIndex((s) => s.schoolName === school.schoolName);
            if (schoolIndex !== -1) {
                for (const dept of school.departments) {
                    let deptIndex = combined.schools[schoolIndex].departments.findIndex(
                        (d) => d.deptCode === dept.deptCode
                    );
                    if (deptIndex !== -1) {
                        let courses = new Set(combined.schools[schoolIndex].departments[deptIndex].courses);
                        for (const course of dept.courses) {
                            courses.add(course);
                        }
                        courses = Array.from(courses);
                        courses.sort(
                            (left, right) =>
                                parseInt(left.courseNumber.replace(/\D/g, '')) >
                                parseInt(right.courseNumber.replace(/\D/g, ''))
                        );
                        combined.schools[schoolIndex].departments[deptIndex].courses = courses;
                    } else {
                        combined.schools[schoolIndex].departments.push(dept);
                    }
                }
            } else {
                combined.schools.push(school);
            }
        }
    }
    return combined;
}

export async function queryWebsocMultiple(params, fieldName) {
    let responses = [];
    for (const field of params[fieldName].trim().replace(' ', '').split(',')) {
        let req = JSON.parse(JSON.stringify(params));
        req[fieldName] = field;
        responses.push(await queryWebsoc(req));
    }
    const res = responses.find((r) => r.status === 400);
    if (res) {
        return res;
    }
    return combineSOCObjects(responses);
}

export const addCoursesMultiple = (courseInfo, term, scheduleIndex) => {
    let sectionsAdded = 0;
    for (const section of Object.values(courseInfo)) {
        addCourse(section.section, section.courseDetails, term, scheduleIndex, undefined, true);
        ++sectionsAdded;
    }
    const terms = termsInSchedule(AppStore.getAddedCourses(), term, scheduleIndex);
    if (terms.size > 1) warnMultipleTerms(terms);
    return sectionsAdded;
};

export const termsInSchedule = (courses, term, scheduleIndex) =>
    new Set([
        term,
        ...courses.filter((course) => course.scheduleIndices.includes(scheduleIndex)).map((course) => course.term),
    ]);

export const warnMultipleTerms = (terms) => {
    openSnackbar(
        'warning',
        `Course added from different term.\nSchedule now contains courses from ${[...terms].sort().join(', ')}.`,
        null,
        null,
        { whiteSpace: 'pre-line' }
    );
};

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

export function isDarkMode() {
    switch (AppStore.getTheme()) {
        case 'light':
            return false;
        case 'dark':
            return true;
        default:
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}
