import { normalizeGeSelection } from '$components/RightPane/CoursePane/SearchForm/constants';
import {
    type AdvancedSearchParam,
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODES,
    COURSE_SEARCH_VIEWS,
} from '$components/RightPane/CoursePane/SearchParams/constants';
import {
    DEFAULT_ADVANCED_SEARCH_VALUES,
    DEFAULT_MANUAL_SEARCH_VALUES,
    DEFAULT_TERM,
} from '$components/RightPane/CoursePane/SearchParams/defaults';
import { getTermByShortName } from '$lib/term';
import {
    type AATerm,
    WebsocDayOptionSchema,
    WebsocDivisionOptionSchema,
    WebsocFullCoursesOptionSchema,
    WebsocRestrictionCodeOptionSchema,
} from '@packages/antalmanac-types';
import { createParser, createSerializer, parseAsArrayOf, parseAsString, parseAsStringLiteral } from 'nuqs/server';

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

export const courseSearchParamParsers = {
    term: parseAsCourseSearchTerm,
    deptValue: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.deptValue),
    ge: parseAsNormalizedGe,
    courseNumber: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.courseNumber),
    sectionCode: parseAsString.withDefault(DEFAULT_MANUAL_SEARCH_VALUES.sectionCode),
    instructor: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.instructor),
    units: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.units),
    endTime: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.endTime),
    startTime: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.startTime),
    fullCourses: parseAsStringLiteral(WebsocFullCoursesOptionSchema.options).withDefault(
        DEFAULT_ADVANCED_SEARCH_VALUES.fullCourses
    ),
    building: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.building),
    room: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.room),
    division: parseAsStringLiteral(WebsocDivisionOptionSchema.options).withDefault(
        DEFAULT_ADVANCED_SEARCH_VALUES.division
    ),
    excludeRoadmapCourses: parseAsString.withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.excludeRoadmapCourses),
    excludeRestrictionCodes: parseAsArrayOf(
        parseAsStringLiteral(WebsocRestrictionCodeOptionSchema.options)
    ).withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.excludeRestrictionCodes),
    days: parseAsArrayOf(parseAsStringLiteral(WebsocDayOptionSchema.options)).withDefault(
        DEFAULT_ADVANCED_SEARCH_VALUES.days
    ),
    courseIds: parseAsArrayOf(parseAsString).withDefault(DEFAULT_ADVANCED_SEARCH_VALUES.courseIds),
};

export const advancedSearchParsers: Pick<typeof courseSearchParamParsers, AdvancedSearchParam> = {
    instructor: courseSearchParamParsers.instructor,
    units: courseSearchParamParsers.units,
    endTime: courseSearchParamParsers.endTime,
    startTime: courseSearchParamParsers.startTime,
    fullCourses: courseSearchParamParsers.fullCourses,
    building: courseSearchParamParsers.building,
    room: courseSearchParamParsers.room,
    division: courseSearchParamParsers.division,
    excludeRoadmapCourses: courseSearchParamParsers.excludeRoadmapCourses,
    excludeRestrictionCodes: courseSearchParamParsers.excludeRestrictionCodes,
    days: courseSearchParamParsers.days,
    courseIds: courseSearchParamParsers.courseIds,
};

export const searchModeParser = parseAsStringLiteral(COURSE_SEARCH_MODES).withDefault(COURSE_SEARCH_MODE.QUICK);

export const searchViewParser = parseAsStringLiteral(COURSE_SEARCH_VIEWS);

export const serializeCourseSearchParams = createSerializer(courseSearchParamParsers);
