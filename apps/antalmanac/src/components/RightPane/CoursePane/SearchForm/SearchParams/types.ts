import { ADVANCED_SEARCH_PARAMS } from '$components/RightPane/CoursePane/SearchForm/constants';
import {
    COURSE_SEARCH_MODES,
    COURSE_SEARCH_VIEWS,
    MANUAL_SEARCH_FIELDS,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import type { AATerm } from '@packages/antalmanac-types';

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

export type CourseSearchMode = (typeof COURSE_SEARCH_MODES)[number];
export type CourseSearchView = (typeof COURSE_SEARCH_VIEWS)[number];

export type AdvancedSearchParams = Pick<CourseSearchParams, (typeof ADVANCED_SEARCH_PARAMS)[number]>;
export type ManualSearchParams = Pick<CourseSearchParams, (typeof MANUAL_SEARCH_FIELDS)[number]>;
