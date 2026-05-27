import {
    COURSE_SEARCH_MODES,
    COURSE_SEARCH_VIEWS,
    DEFAULT_FORM_DATA,
    type AdvancedSearchParam,
    type ManualSearchParam,
} from '$components/RightPane/CoursePane/SearchParams/constants';

export type CourseSearchParams = typeof DEFAULT_FORM_DATA;

export type CourseSearchMode = (typeof COURSE_SEARCH_MODES)[number];

export type CourseSearchView = (typeof COURSE_SEARCH_VIEWS)[number];

export type ManualSearchParams = Pick<CourseSearchParams, ManualSearchParam>;

export type AdvancedSearchParams = Pick<CourseSearchParams, AdvancedSearchParam>;
