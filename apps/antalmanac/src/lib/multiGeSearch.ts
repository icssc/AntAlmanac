import { ANY_GE, GE_LIST } from '$components/RightPane/CoursePane/SearchForm/constants';
import trpc from '$lib/api/trpc';
import type { WebsocSearchInput } from '@packages/antalmanac-types';
import type { WebsocAPIResponse } from '@packages/anteater-api/types';
import { splitWebsocIntersectAndRest } from '@packages/anteater-api/utils';

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

export type ManualSearchWebsocSplit = {
    intersect: WebsocAPIResponse;
    rest: WebsocAPIResponse;
};

export async function queryManualSearchCourses(params: WebsocSearchInput): Promise<ManualSearchWebsocSplit> {
    const selectedGEs = getSelectedGEs(params.ge ?? '');

    const responses = await trpc.websoc.getManyOfField.query({
        params: { ...params, ge: selectedGEs.join(',') },
        fieldName: 'ge',
    });
    return splitWebsocIntersectAndRest(responses);
}
