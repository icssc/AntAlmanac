import {
    AdvancedSearchParam,
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODES,
    COURSE_SEARCH_VIEWS,
    DEFAULT_ADVANCED_SEARCH_VALUES,
    DEFAULT_MANUAL_SEARCH_VALUES,
    DEFAULT_TERM,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';
import { getTermByShortName } from '$lib/term';
import { type AATerm } from '@packages/antalmanac-types';
import { WEBSOC_FILTER_GE_VALUES } from '@packages/anteater-api/types';
import {
    createParser,
    createSerializer,
    parseAsArrayOf,
    parseAsString,
    parseAsStringLiteral,
    type SingleParserBuilder,
} from 'nuqs';

type CourseSearchParamParser<K extends keyof CourseSearchParams> = SingleParserBuilder<CourseSearchParams[K]> & {
    readonly defaultValue: CourseSearchParams[K];
};

type CourseSearchParamParserMap = {
    [K in keyof CourseSearchParams]: CourseSearchParamParser<K>;
};

const parseAsCourseSearchTerm = createParser<AATerm>({
    parse: (value: string) => getTermByShortName(value) ?? null,
    serialize: (value: AATerm) => value.shortName,
    eq: (a: AATerm, b: AATerm) => a.shortName === b.shortName,
}).withDefault(DEFAULT_TERM);

export const courseSearchParamParsers: CourseSearchParamParserMap = {
    term: parseAsCourseSearchTerm,
    deptValue: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.deptValue),
    ge: parseAsArrayOf(parseAsStringLiteral(WEBSOC_FILTER_GE_VALUES)).withDefault(DEFAULT_MANUAL_SEARCH_VALUES.ge),
    courseNumber: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.courseNumber),
    sectionCode: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.sectionCode),
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
};

export const advancedSearchParsers: Pick<CourseSearchParamParserMap, AdvancedSearchParam> = {
    instructor: courseSearchParamParsers.instructor,
    units: courseSearchParamParsers.units,
    endTime: courseSearchParamParsers.endTime,
    startTime: courseSearchParamParsers.startTime,
    coursesFull: courseSearchParamParsers.coursesFull,
    building: courseSearchParamParsers.building,
    room: courseSearchParamParsers.room,
    division: courseSearchParamParsers.division,
    excludeRoadmapCourses: courseSearchParamParsers.excludeRoadmapCourses,
    excludeRestrictionCodes: courseSearchParamParsers.excludeRestrictionCodes,
    days: courseSearchParamParsers.days,
};

export const searchModeParser = parseAsStringLiteral(COURSE_SEARCH_MODES).withDefault(COURSE_SEARCH_MODE.QUICK);

export const searchViewParser = parseAsStringLiteral(COURSE_SEARCH_VIEWS);

export const plannerSearchParser = parseAsString;

export const serializeCourseSearchParams = createSerializer(courseSearchParamParsers);
