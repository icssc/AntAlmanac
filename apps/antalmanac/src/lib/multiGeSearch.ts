import { ANY_GE, GE_LIST } from '$components/RightPane/CoursePane/SearchForm/constants';

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
