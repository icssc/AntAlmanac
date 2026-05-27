import {
    ADVANCED_SEARCH_PARAMS,
    COURSE_SEARCH_VIEW,
    DEFAULT_ADVANCED_SEARCH_VALUES,
    DEFAULT_FORM_DATA,
    MANUAL_SEARCH_PARAMS,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import type {
    AdvancedSearchParams,
    CourseSearchParams,
    CourseSearchView,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';

/** Enough to run a WebSOC search (dept, GE, section, or instructor). */
export function isValidSearch(formData: CourseSearchParams) {
    const { ge, deptValue, sectionCode, instructor } = formData;
    return (
        ge.length > 0 ||
        deptValue !== DEFAULT_FORM_DATA.deptValue ||
        sectionCode !== DEFAULT_FORM_DATA.sectionCode ||
        instructor !== DEFAULT_FORM_DATA.instructor
    );
}

export function hasManualParams(formData: CourseSearchParams) {
    return MANUAL_SEARCH_PARAMS.some((key) => {
        if (key === 'term') {
            return formData.term.shortName !== DEFAULT_FORM_DATA.term.shortName;
        }
        if (key === 'ge') {
            return formData.ge.length > 0;
        }
        return formData[key] !== DEFAULT_FORM_DATA[key];
    });
}

export function hasAdvancedParams(formData: AdvancedSearchParams) {
    return ADVANCED_SEARCH_PARAMS.some((key) => formData[key] !== DEFAULT_ADVANCED_SEARCH_VALUES[key]);
}

export function shouldShowSearchForm(formData: CourseSearchParams) {
    const hasPrimarySearchInput =
        formData.sectionCode !== DEFAULT_FORM_DATA.sectionCode ||
        formData.courseNumber !== DEFAULT_FORM_DATA.courseNumber ||
        formData.ge.length > 0 ||
        formData.deptValue !== DEFAULT_FORM_DATA.deptValue ||
        formData.instructor !== DEFAULT_FORM_DATA.instructor;

    return !hasPrimarySearchInput || !isValidSearch(formData);
}

export function deriveCourseSearchView(
    formData: CourseSearchParams,
    manualSearchEnabled: boolean,
    viewParam: CourseSearchView | null
) {
    const derivedView: CourseSearchView = shouldShowSearchForm(formData)
        ? COURSE_SEARCH_VIEW.SEARCH_FORM
        : COURSE_SEARCH_VIEW.RESULTS;
    const view: CourseSearchView = manualSearchEnabled
        ? (viewParam ?? COURSE_SEARCH_VIEW.SEARCH_FORM)
        : (viewParam ?? derivedView);

    return {
        view,
        searchFormIsDisplayed: view === COURSE_SEARCH_VIEW.SEARCH_FORM,
    };
}
