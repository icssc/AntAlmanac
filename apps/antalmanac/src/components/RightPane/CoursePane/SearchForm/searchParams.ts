import {
    PLANNER_SEARCH_PARAM,
    type AdvancedSearchParam,
    MANUAL_SEARCH_PARAMS,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { normalizeGeSelection } from '$lib/multiGeSearch';
import { getDefaultTerm, getTermByShortName } from '$lib/term';
import { WebsocFullCoursesOptionSchema, type AATerm } from '@packages/antalmanac-types';
import { createParser, createSerializer, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { useCallback, useEffect } from 'react';

const REPLACE_HISTORY_OPTIONS = { history: 'replace' as const };

type AdvancedSearchDefaults = Omit<CourseSearchParams, 'term' | 'deptValue' | 'ge' | 'courseNumber' | 'sectionCode'>;

const defaultTerm = getDefaultTerm();

export const defaultAdvancedSearchValues: AdvancedSearchDefaults = {
    instructor: '',
    units: '',
    endTime: '',
    startTime: '',
    coursesFull: 'ANY',
    building: '',
    room: '',
    division: '',
    excludeRoadmapCourses: '',
    excludeRestrictionCodes: '',
    days: '',
};

export interface CourseSearchParams {
    term: AATerm;
    deptValue: string;
    ge: string;
    courseNumber: string;
    sectionCode: string;
    instructor: string;
    units: string;
    endTime: string;
    startTime: string;
    coursesFull: string;
    building: string;
    room: string;
    division: string;
    excludeRoadmapCourses: string;
    excludeRestrictionCodes: string;
    days: string;
}

export type CourseSearchField = Exclude<keyof CourseSearchParams, 'term'>;

interface CoursePaneUrlState {
    manualSearchEnabled: boolean;
    advancedSearchEnabled: boolean;
    searchFormIsDisplayed: boolean;
}

export const defaultCourseSearchFormValues: CourseSearchParams = {
    term: defaultTerm,
    deptValue: 'ALL',
    ge: 'ANY',
    courseNumber: '',
    sectionCode: '',
    ...defaultAdvancedSearchValues,
};

const createStringParser = (defaultValue = '') =>
    parseAsString.withOptions(REPLACE_HISTORY_OPTIONS).withDefault(defaultValue);

const parseAsCourseSearchTerm = createParser<AATerm>({
    parse: (value) => getTermByShortName(value) ?? null,
    serialize: (value) => value.shortName,
    eq: (a, b) => a.shortName === b.shortName,
})
    .withOptions(REPLACE_HISTORY_OPTIONS)
    .withDefault(defaultTerm);

const parseAsNormalizedGe = createParser<string>({
    parse: (value) => normalizeGeSelection(value),
    serialize: (value) => normalizeGeSelection(value),
    eq: (a, b) => normalizeGeSelection(a) === normalizeGeSelection(b),
})
    .withOptions(REPLACE_HISTORY_OPTIONS)
    .withDefault(defaultCourseSearchFormValues.ge);

const parseAsOptionalBoolean = createParser<boolean>({
    parse: (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return null;
    },
    serialize: (value) => (value ? 'true' : 'false'),
    eq: (a, b) => a === b,
}).withOptions(REPLACE_HISTORY_OPTIONS);

export const courseSearchParamParsers = {
    term: parseAsCourseSearchTerm,
    deptValue: createStringParser(defaultCourseSearchFormValues.deptValue),
    ge: parseAsNormalizedGe,
    courseNumber: createStringParser(defaultCourseSearchFormValues.courseNumber),
    sectionCode: createStringParser(defaultCourseSearchFormValues.sectionCode),
    instructor: createStringParser(defaultAdvancedSearchValues.instructor),
    units: createStringParser(defaultAdvancedSearchValues.units),
    endTime: createStringParser(defaultAdvancedSearchValues.endTime),
    startTime: createStringParser(defaultAdvancedSearchValues.startTime),
    coursesFull: createStringParser(WebsocFullCoursesOptionSchema.options[0]),
    building: createStringParser(defaultAdvancedSearchValues.building),
    room: createStringParser(defaultAdvancedSearchValues.room),
    division: createStringParser(defaultAdvancedSearchValues.division),
    excludeRoadmapCourses: createStringParser(defaultAdvancedSearchValues.excludeRoadmapCourses),
    excludeRestrictionCodes: createStringParser(defaultAdvancedSearchValues.excludeRestrictionCodes),
    days: createStringParser(defaultAdvancedSearchValues.days),
};

const coursePaneUiParamParsers = {
    manual: parseAsOptionalBoolean,
    advanced: parseAsOptionalBoolean,
    showSearch: parseAsOptionalBoolean,
};

export const serializeCourseSearchParams = createSerializer(courseSearchParamParsers);

export function buildCourseSearchFormData(
    values: Partial<CourseSearchParams> = defaultCourseSearchFormValues
): CourseSearchParams {
    return {
        ...defaultCourseSearchFormValues,
        ...values,
        term: values.term ?? defaultCourseSearchFormValues.term,
        ge: normalizeGeSelection(values.ge ?? defaultCourseSearchFormValues.ge),
    };
}

export function courseSearchFormDataIsValid(formData: CourseSearchParams) {
    const { ge, deptValue, sectionCode, instructor } = formData;
    return ge.toUpperCase() !== 'ANY' || deptValue.toUpperCase() !== 'ALL' || sectionCode !== '' || instructor !== '';
}

export function courseSearchFormDataHasAdvancedSearch(formData: CourseSearchParams) {
    const formFields = Object.keys(defaultAdvancedSearchValues) as AdvancedSearchParam[];
    return formFields.some((key) => formData[key] !== defaultAdvancedSearchValues[key]);
}

export function courseSearchFormDataHasManualSearch(formData: CourseSearchParams) {
    const formFields = MANUAL_SEARCH_PARAMS as readonly (keyof CourseSearchParams)[];
    return formFields.some((key) => {
        if (key === 'term') {
            return formData.term.shortName !== defaultCourseSearchFormValues.term.shortName;
        }

        return formData[key] !== defaultCourseSearchFormValues[key];
    });
}

export function courseSearchFormDataHasRequiredSearchParams(formData: CourseSearchParams) {
    return (
        formData.sectionCode !== '' ||
        formData.courseNumber !== '' ||
        formData.ge !== 'ANY' ||
        formData.deptValue !== 'ALL'
    );
}

export function useCourseSearchUrlState() {
    const [formData, setFormData] = useQueryStates(courseSearchParamParsers);

    const setField = useCallback(
        <Field extends CourseSearchField>(field: Field, value: CourseSearchParams[Field]) => {
            return setFormData({ [field]: value });
        },
        [setFormData]
    );

    const setFields = useCallback(
        (values: Partial<CourseSearchParams> | null) => {
            return setFormData(values);
        },
        [setFormData]
    );

    const setTerm = useCallback(
        (term: AATerm) => {
            return setFormData({ term });
        },
        [setFormData]
    );

    const resetAll = useCallback(() => {
        return setFormData(defaultCourseSearchFormValues);
    }, [setFormData]);

    const resetAdvanced = useCallback(() => {
        return setFormData(defaultAdvancedSearchValues);
    }, [setFormData]);

    return {
        formData,
        setField,
        setFields,
        setFormData,
        setTerm,
        resetAll,
        resetAdvanced,
        defaultFormData: defaultCourseSearchFormValues,
    };
}

export function useCoursePaneUrlState() {
    const { formData } = useCourseSearchUrlState();
    const [plannerSearchParam] = useQueryState(
        PLANNER_SEARCH_PARAM,
        parseAsString.withOptions(REPLACE_HISTORY_OPTIONS)
    );
    const [paneState, setPaneState] = useQueryStates(coursePaneUiParamParsers);

    const derivedManualSearchEnabled = courseSearchFormDataHasManualSearch(formData) && plannerSearchParam === null;
    const derivedAdvancedSearchEnabled = courseSearchFormDataHasAdvancedSearch(formData);
    const derivedSearchFormIsDisplayed =
        !courseSearchFormDataHasRequiredSearchParams(formData) || !courseSearchFormDataIsValid(formData);

    const manualSearchEnabled = paneState.manual ?? derivedManualSearchEnabled;
    const advancedSearchEnabled = paneState.advanced ?? derivedAdvancedSearchEnabled;
    const searchFormIsDisplayed = paneState.showSearch ?? derivedSearchFormIsDisplayed;

    useEffect(() => {
        const nextState: Partial<typeof paneState> = {};

        if (paneState.manual === null) {
            nextState.manual = derivedManualSearchEnabled;
        }
        if (paneState.advanced === null) {
            nextState.advanced = derivedAdvancedSearchEnabled;
        }
        if (paneState.showSearch === null) {
            nextState.showSearch = derivedSearchFormIsDisplayed;
        }

        if (Object.keys(nextState).length > 0) {
            void setPaneState(nextState);
        }
    }, [
        derivedAdvancedSearchEnabled,
        derivedManualSearchEnabled,
        derivedSearchFormIsDisplayed,
        paneState.advanced,
        paneState.manual,
        paneState.showSearch,
        setPaneState,
    ]);

    const setManualSearchEnabled = useCallback(
        (value: boolean) => {
            return setPaneState({ manual: value });
        },
        [setPaneState]
    );

    const setAdvancedSearchEnabled = useCallback(
        (value: boolean) => {
            return setPaneState({ advanced: value });
        },
        [setPaneState]
    );

    const setSearchFormIsDisplayed = useCallback(
        (value: boolean) => {
            return setPaneState({ showSearch: value });
        },
        [setPaneState]
    );

    return {
        ...paneState,
        formData,
        manualSearchEnabled,
        advancedSearchEnabled,
        searchFormIsDisplayed,
        setManualSearchEnabled,
        setAdvancedSearchEnabled,
        displaySearch: () => setSearchFormIsDisplayed(true),
        displaySections: () => setSearchFormIsDisplayed(false),
    } satisfies CoursePaneUrlState & {
        manual: boolean | null;
        advanced: boolean | null;
        showSearch: boolean | null;
        formData: CourseSearchParams;
        setManualSearchEnabled: (value: boolean) => Promise<URLSearchParams>;
        setAdvancedSearchEnabled: (value: boolean) => Promise<URLSearchParams>;
        displaySearch: () => Promise<URLSearchParams>;
        displaySections: () => Promise<URLSearchParams>;
    };
}
