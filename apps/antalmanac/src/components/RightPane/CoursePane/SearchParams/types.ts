import {
    COURSE_SEARCH_MODES,
    COURSE_SEARCH_VIEWS,
    type AdvancedSearchParam,
    type ManualSearchParam,
} from '$components/RightPane/CoursePane/SearchParams/constants';
import { courseSearchParamParsers } from '$components/RightPane/CoursePane/SearchParams/parsers';
import type { SingleParserBuilder } from 'nuqs';

type InferParserValue<P> = P extends SingleParserBuilder<infer T> ? T : never;

export type CourseSearchParams = {
    [K in keyof typeof courseSearchParamParsers]: InferParserValue<(typeof courseSearchParamParsers)[K]>;
};

export type ManualSearchParams = Pick<CourseSearchParams, ManualSearchParam>;

export type AdvancedSearchParams = Pick<CourseSearchParams, AdvancedSearchParam>;

export type CourseSearchMode = (typeof COURSE_SEARCH_MODES)[number];

export type CourseSearchView = (typeof COURSE_SEARCH_VIEWS)[number];
