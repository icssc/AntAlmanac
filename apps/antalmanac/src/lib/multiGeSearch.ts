import { ANY_GE, GE_LIST } from '$components/RightPane/CoursePane/SearchForm/constants';
import trpc from '$lib/api/trpc';
import type { WebsocSearchInput } from '@packages/antalmanac-types';
import { AACourse } from '@packages/antalmanac-types';
import { WebsocDepartment, WebsocSchool } from '@packages/anteater-api/types';
import { mergeWebsocIntersectThenRest, websocCourseKey } from '@packages/anteater-api/utils';

const VALID_GES: Set<string> = new Set(GE_LIST.map((option) => option.value).filter((value) => value !== ANY_GE));

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

export async function queryManualSearchCourses(params: WebsocSearchInput) {
    const selectedGEs = getSelectedGEs(params.ge ?? '');

    const responses = await trpc.websoc.getManyOfField.query({
        params: { ...params, ge: selectedGEs.join(',') },
        fieldName: 'ge',
    });
    const { response, intersectionCourseKeys } = mergeWebsocIntersectThenRest(responses);

    return {
        response,
        sharedCourseKeys: intersectionCourseKeys,
    };
}

export const getMultiGeCourseKey = websocCourseKey;

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
        } else if ('sections' in item && sharedCourseKeys.has(websocCourseKey(item.deptCode, item.courseNumber))) {
            schoolIsAnd = true;
        }
    }
    if (orBannerIdx === -1 && currSchoolIdx !== -1 && !schoolIsAnd) {
        orBannerIdx = currSchoolIdx;
    }
    return orBannerIdx;
}
