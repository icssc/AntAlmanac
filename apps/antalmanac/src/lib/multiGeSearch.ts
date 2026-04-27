import { WebsocAPIResponse, WebsocDepartment, WebsocSchool } from '@packages/antalmanac-types';

import { WebSOC } from '$lib/websoc';

const ANY_GE = 'ANY';
const VALID_GES = new Set(['GE-1A', 'GE-1B', 'GE-2', 'GE-3', 'GE-4', 'GE-5A', 'GE-5B', 'GE-6', 'GE-7', 'GE-8']);

const getCourseKey = (deptCode: string, courseNumber: string) => `${deptCode}::${courseNumber}`.replace(/\s+/g, '');

const getSelectedGEs = (ge: string) => {
    if (!ge) return [];

    const normalized = ge
        .split(',')
        .map((value) => value.trim().toUpperCase())
        .filter((value) => VALID_GES.has(value));

    if (normalized.length === 0 || normalized.includes(ANY_GE)) {
        return [];
    }

    return [...new Set(normalized)];
};

const getResponseCourseKeys = (response: WebsocAPIResponse) =>
    new Set(
        response.schools.flatMap((school) =>
            school.departments.flatMap((department) =>
                department.courses.map((course) => getCourseKey(course.deptCode, course.courseNumber))
            )
        )
    );

const queryWebsoc = (params: Record<string, string>) =>
    params.units.includes(',') ? WebSOC.queryMultiple(params, 'units') : WebSOC.query(params);

const getSharedCourseKeys = (responses: WebsocAPIResponse[]) => {
    const [firstResponse, ...restResponses] = responses;
    let sharedCourseKeys = getResponseCourseKeys(firstResponse);

    for (const response of restResponses) {
        const keys = getResponseCourseKeys(response);
        sharedCourseKeys = new Set([...sharedCourseKeys].filter((key) => keys.has(key)));
    }

    return sharedCourseKeys;
};

const buildAndSchools = (firstResponse: WebsocAPIResponse, sharedCourseKeys: Set<string>) =>
    firstResponse.schools
        .map((school) => ({
            ...school,
            departments: school.departments
                .map((department) => ({
                    ...department,
                    courses: department.courses.filter((course) =>
                        sharedCourseKeys.has(getCourseKey(course.deptCode, course.courseNumber))
                    ),
                }))
                .filter((department) => department.courses.length > 0),
        }))
        .filter((school) => school.departments.length > 0);

const buildOrSchools = (responses: WebsocAPIResponse[], sharedCourseKeys: Set<string>) => {
    const appendedKeys = new Set(sharedCourseKeys);
    const orSchools: WebsocSchool[] = [];
    const schoolMap = new Map<string, WebsocSchool>();
    const deptMap = new Map<string, WebsocDepartment>();

    for (const response of responses) {
        for (const school of response.schools) {
            for (const department of school.departments) {
                for (const course of department.courses) {
                    const courseKey = getCourseKey(course.deptCode, course.courseNumber);
                    if (appendedKeys.has(courseKey)) continue;

                    appendedKeys.add(courseKey);

                    let orSchool = schoolMap.get(school.schoolName);
                    if (!orSchool) {
                        orSchool = { ...school, departments: [] };
                        orSchools.push(orSchool);
                        schoolMap.set(school.schoolName, orSchool);
                    }

                    const deptKey = `${school.schoolName}::${department.deptCode}`;
                    let orDepartment = deptMap.get(deptKey);
                    if (!orDepartment) {
                        orDepartment = { ...department, courses: [] };
                        orSchool.departments.push(orDepartment);
                        deptMap.set(deptKey, orDepartment);
                    }

                    orDepartment.courses.push(course);
                }
            }
        }
    }

    return orSchools;
};

export async function queryManualSearchCourses(params: Record<string, string>) {
    const selectedGEs = getSelectedGEs(params.ge);

    if (selectedGEs.length <= 1) {
        return {
            response: await queryWebsoc(params),
            sharedCourseKeys: new Set<string>(),
        };
    }

    const responses = await Promise.all(selectedGEs.map((ge) => queryWebsoc({ ...params, ge })));
    const [firstResponse] = responses;
    const sharedCourseKeys = getSharedCourseKeys(responses);
    const andSchools = buildAndSchools(firstResponse, sharedCourseKeys);
    const orSchools = buildOrSchools(responses, sharedCourseKeys);

    return {
        response: {
            ...firstResponse,
            schools: [...andSchools, ...orSchools],
        },
        sharedCourseKeys,
    };
}

export const getMultiGeCourseKey = getCourseKey;
