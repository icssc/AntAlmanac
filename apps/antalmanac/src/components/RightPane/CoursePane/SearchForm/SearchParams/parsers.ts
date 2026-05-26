import { normalizeGeSelection } from '$components/RightPane/CoursePane/SearchForm/constants';
import {
    AdvancedSearchParam,
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODES,
    COURSE_SEARCH_VIEWS,
    DEFAULT_ADVANCED_SEARCH_VALUES,
    DEFAULT_MANUAL_SEARCH_VALUES,
    DEFAULT_TERM,
    ManualSearchParam,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import { getTermByShortName } from '$lib/term';
import { type AATerm } from '@packages/antalmanac-types';
import { createParser, createSerializer, parseAsString, parseAsStringLiteral, SingleParser } from 'nuqs';

const parseAsCourseSearchTerm = createParser<AATerm>({
    parse: (value: string) => getTermByShortName(value) ?? null,
    serialize: (value: AATerm) => value.shortName,
    eq: (a: AATerm, b: AATerm) => a.shortName === b.shortName,
}).withDefault(DEFAULT_TERM);

const parseAsNormalizedGe = createParser<string>({
    parse: (value: string) => normalizeGeSelection(value),
    serialize: (value: string) => normalizeGeSelection(value),
    eq: (a: string, b: string) => normalizeGeSelection(a) === normalizeGeSelection(b),
}).withDefault(DEFAULT_MANUAL_SEARCH_VALUES.ge);

export const manualSearchParsers = {
    term: parseAsCourseSearchTerm,
    deptValue: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.deptValue),
    ge: parseAsNormalizedGe,
    courseNumber: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.courseNumber),
    sectionCode: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.sectionCode),
} satisfies Record<ManualSearchParam, SingleParser<string> | SingleParser<AATerm>>;

export const advancedSearchParsers = {
    instructor: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.instructor),
    units: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.units),
    endTime: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.endTime),
    startTime: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.startTime),
    coursesFull: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.coursesFull),
    building: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.building),
    room: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.room),
    division: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.division),
    excludeRoadmapCourses: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.excludeRoadmapCourses),
    excludeRestrictionCodes: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.excludeRestrictionCodes),
    days: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.days),
} satisfies Record<AdvancedSearchParam, SingleParser<string>>;

export const courseSearchParamParsers = {
    ...manualSearchParsers,
    ...advancedSearchParsers,
};

export const searchModeParser = parseAsStringLiteral(COURSE_SEARCH_MODES).withDefault(COURSE_SEARCH_MODE.QUICK);

export const searchViewParser = parseAsStringLiteral(COURSE_SEARCH_VIEWS);

export const plannerSearchParser = parseAsString;

export const serializeCourseSearchParams = createSerializer(courseSearchParamParsers);
