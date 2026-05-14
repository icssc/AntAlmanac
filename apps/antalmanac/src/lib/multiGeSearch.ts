import { ANY_GE, GE_LIST } from '$components/RightPane/CoursePane/SearchForm/constants';
import trpc from '$lib/api/trpc';
import type { WebsocSearchInput } from '$src/backend/routers/websoc';
import { AACourse } from '@packages/antalmanac-types';
import { GE, WebsocAPIResponse, WebsocDepartment, WebsocSchool } from '@packages/anteater-api/types';

const VALID_GES: Set<string> = new Set(GE_LIST.map((option) => option.value).filter((value) => value !== ANY_GE));

const getCourseKey = (deptCode: string, courseNumber: string) => `${deptCode}::${courseNumber}`.replace(/\s+/g, '');

const parseSelectedGEs = (ge: string) => {
    const validGEs = ge
        .split(',')
        .map((value) => value.trim().toUpperCase())
        .filter((value) => VALID_GES.has(value));

    return validGEs.length === 0 ? [] : [...new Set(validGEs)];
};

export const getSelectedGEs = (ge: string) => parseSelectedGEs(ge);
export const normalizeGeSelection = (ge: string) => {
    const selectedGEs = parseSelectedGEs(ge);
    return selectedGEs.length > 0 ? selectedGEs.join(',') : ANY_GE;
};
export const isMultiGeSelection = (ge: string) => parseSelectedGEs(ge).length > 1;

export const gradesGeForManualSearch = (ge: string): GE =>
    ge !== ANY_GE && !ge.includes(',') ? (ge as GE) : (ANY_GE as GE);

const getCourseKeys = (response: WebsocAPIResponse) =>
    new Set(
        response.schools.flatMap((school) =>
            school.departments.flatMap((department) =>
                department.courses.map((course) => getCourseKey(course.deptCode, course.courseNumber))
            )
        )
    );

const queryWebsoc = (params: WebsocSearchInput) =>
    params.units?.includes(',')
        ? trpc.websoc.getManyOfField.query({ params, fieldName: 'units' })
        : trpc.websoc.getOne.query(params);

const getSharedCourseKeys = (responses: WebsocAPIResponse[]) => {
    const [firstResponse, ...restResponses] = responses;
    let sharedCourseKeys = getCourseKeys(firstResponse);

    for (const response of restResponses) {
        const keys = getCourseKeys(response);
        sharedCourseKeys = new Set([...sharedCourseKeys].filter((key) => keys.has(key)));
    }

    return sharedCourseKeys;
};

const buildAnd = (firstResponse: WebsocAPIResponse, sharedCourseKeys: Set<string>) =>
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

const buildOr = (responses: WebsocAPIResponse[], sharedCourseKeys: Set<string>) => {
    const seenCourseKeys = new Set(sharedCourseKeys);
    const orBlock: WebsocSchool[] = [];
    const schoolMap = new Map<string, WebsocSchool>();
    const deptMap = new Map<string, WebsocDepartment>();

    for (const response of responses) {
        for (const school of response.schools) {
            for (const department of school.departments) {
                for (const course of department.courses) {
                    const courseKey = getCourseKey(course.deptCode, course.courseNumber);
                    if (seenCourseKeys.has(courseKey)) continue;

                    seenCourseKeys.add(courseKey);

                    let orSchool = schoolMap.get(school.schoolName);
                    if (!orSchool) {
                        orSchool = { ...school, departments: [] };
                        orBlock.push(orSchool);
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

    return orBlock;
};

export async function queryManualSearchCourses(params: WebsocSearchInput) {
    const selectedGEs = getSelectedGEs(params.ge ?? '');

    if (selectedGEs.length <= 1) {
        return {
            response: await queryWebsoc(params),
            sharedCourseKeys: new Set<string>(),
        };
    }

    const responses = await Promise.all(selectedGEs.map((ge) => queryWebsoc({ ...params, ge })));
    const [firstResponse] = responses;
    const sharedCourseKeys = getSharedCourseKeys(responses);
    const andCourses = buildAnd(firstResponse, sharedCourseKeys);
    const orCourses = buildOr(responses, sharedCourseKeys);

    return {
        response: {
            ...firstResponse,
            schools: [...andCourses, ...orCourses],
        },
        sharedCourseKeys,
    };
}

export const getMultiGeCourseKey = getCourseKey;

export function getMultiGeOrBannerIdx(
    courseData: (WebsocSchool | WebsocDepartment | AACourse)[],
    sharedCourseKeys: Set<string>
): number {
    let orBannerIdx = -1;
    let currSchoolIdx = -1;
    let schoolIsAnd = false;
    for (let i = 0; i < courseData.length; i++) {
        const item = courseData[i];
        if ('departments' in item) {
            if (currSchoolIdx !== -1 && !schoolIsAnd) {
                orBannerIdx = currSchoolIdx;
                break;
            }
            currSchoolIdx = i;
            schoolIsAnd = false;
        } else if ('sections' in item && sharedCourseKeys.has(getCourseKey(item.deptCode, item.courseNumber))) {
            schoolIsAnd = true;
        }
    }
    if (orBannerIdx === -1 && currSchoolIdx !== -1 && !schoolIsAnd) {
        orBannerIdx = currSchoolIdx;
    }
    return orBannerIdx;
}
