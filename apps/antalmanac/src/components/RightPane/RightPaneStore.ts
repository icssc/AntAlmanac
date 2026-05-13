import { EventEmitter } from 'events';

import {
    AdvancedSearchParam,
    BasicSearchParam,
    ManualSearchParam,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { normalizeGeSelection } from '$lib/multiGeSearch';
import { getDefaultTerm, isTermAvailable, type Term } from '$lib/term';
import { openSnackbar } from '$stores/SnackbarStore';

const defaultBasicSearchValues: Record<BasicSearchParam, Term> = {
    term: getDefaultTerm(),
};

const defaultAdvancedSearchValues: Record<AdvancedSearchParam, string> = {
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

const defaultFormValues: Record<Exclude<ManualSearchParam, 'term'>, string> & { term: Term } = {
    deptValue: 'ALL',
    ge: 'ANY',
    courseNumber: '',
    sectionCode: '',
    ...defaultBasicSearchValues,
    ...defaultAdvancedSearchValues,
};

export type CourseSearchParams = typeof defaultFormValues;
type CourseSearchParamKey = keyof CourseSearchParams;

export enum CourseSearchWarningType {
    TermUnavailable = 'termUnavailable',
}

class RightPaneStore extends EventEmitter {
    private formData: CourseSearchParams;
    private prevFormData?: CourseSearchParams;
    private multiSearchData: CourseSearchParams[];
    private warningMessages: Record<CourseSearchWarningType, string[]>;
    private urlSectionCodeValue: string;
    private urlTermValue: string;
    private urlGEValue: string;
    private urlCourseNumValue: string;
    private urlDeptValue: string;

    private normalizeGeQueryParam = (search: URLSearchParams) => {
        const rawGeValue = search.get('ge') ?? search.get('GE');
        if (rawGeValue == null) {
            return;
        }

        const normalizedGe = normalizeGeSelection(rawGeValue);
        const currentGe = search.get('ge');
        const hadUppercaseGeParam = search.has('GE');

        search.delete('GE');
        if (normalizedGe === 'ANY') {
            search.delete('ge');
        } else {
            search.set('ge', normalizedGe);
        }

        const wasChanged = (currentGe ?? '') !== (normalizedGe === 'ANY' ? '' : normalizedGe) || hadUppercaseGeParam;
        if (!wasChanged) {
            return;
        }

        const nextQuery = search.toString();
        const nextURL = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
        history.replaceState({ url: 'url' }, 'url', nextURL);
    };

    constructor() {
        super();
        this.setMaxListeners(15);
        this.formData = structuredClone(defaultFormValues);
        const search = new URLSearchParams(window.location.search);
        this.normalizeGeQueryParam(search);
        this.multiSearchData = [];
        this.warningMessages = { [CourseSearchWarningType.TermUnavailable]: [] };
        this.urlSectionCodeValue = search.get('sectionCode') || '';
        this.urlTermValue = search.get('term') || '';
        this.urlGEValue = search.get('ge') || '';
        this.urlCourseNumValue = search.get('courseNumber') || '';
        this.urlDeptValue = search.get('deptValue') || '';

        this.updateFormDataFromURL(search);
    }

    updateFormDataFromURL = (search: URLSearchParams) => {
        const formFields = Object.keys(defaultFormValues) as CourseSearchParamKey[];

        formFields.forEach((field) => {
            const paramValue = search.get(field) || search.get(field.toUpperCase());

            if (paramValue !== null) {
                this.formData[field] = field === 'ge' ? normalizeGeSelection(paramValue) : paramValue;
            }
        });

        if (this.formData.term !== null && !isTermAvailable(this.formData.term)) {
            const fallbackTerm = getDefaultTerm().shortName;
            const message = `${this.formData.term} is currently unavailable, falling back to ${fallbackTerm}`;
            openSnackbar('error', message);
            console.error('Error setting term from URL:', message);

            this.formData.term = getDefaultTerm();

            this.setWarningMessages(CourseSearchWarningType.TermUnavailable, [message]);
        }

        this.emit('formDataChange');
    };

    getFormData = () => {
        return this.formData;
    };

    getDefaultFormData = () => {
        return defaultFormValues;
    };

    getMultiSearchData = () => this.multiSearchData;

    getUrlSectionCodeValue = () => this.urlSectionCodeValue;
    getUrlTermValue = () => this.urlTermValue;
    getUrlGEValue = () => this.urlGEValue;
    getUrlCourseNumValue = () => this.urlCourseNumValue;
    getUrlDeptValue = () => this.urlDeptValue;

    getWarningMessages = () => this.warningMessages;

    updateFormValue = <T extends CourseSearchParamKey>(field: T, value: CourseSearchParams[T]) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    setMultiSearchData = (data: Partial<(typeof this.multiSearchData)[number]>[]) => {
        this.multiSearchData = data.map((params) => ({ ...defaultFormValues, ...params, term: this.formData.term }));
    };

    clearMultiSearchData = () => {
        this.multiSearchData = [];
    };

    storePrevFormData = () => {
        this.prevFormData = structuredClone(this.formData);
    };

    restorePrevFormData = () => {
        this.clearMultiSearchData();
        if (!this.prevFormData) {
            return;
        }
        this.formData = this.prevFormData;
        this.prevFormData = undefined;
        this.emit('formDataChange');
    };

    resetFormValues = () => {
        this.formData = structuredClone(defaultFormValues);
        this.emit('formReset');
    };

    resetAdvancedSearchValues = () => {
        Object.assign(this.formData, defaultAdvancedSearchValues);
        this.emit('formDataChange');
    };

    formDataIsValid = () => {
        const { ge, deptValue, sectionCode, instructor } = this.formData;
        return (
            ge.toUpperCase() !== 'ANY' || deptValue.toUpperCase() !== 'ALL' || sectionCode !== '' || instructor !== ''
        );
    };

    formDataHasAdvancedSearch = () => {
        const formFields = Object.keys(defaultAdvancedSearchValues) as AdvancedSearchParam[];
        return formFields.some((key) => this.formData[key] !== defaultAdvancedSearchValues[key]);
    };

    setWarningMessages = (warningType: CourseSearchWarningType, messages: string[]) => {
        this.warningMessages = { ...this.warningMessages, [warningType]: messages };
    };
    removeWarningMessage = (warningType: CourseSearchWarningType, messageToRemove: string) => {
        const messages = this.warningMessages[warningType];
        messages.splice(messages.indexOf(messageToRemove), 1);
        this.warningMessages = { ...this.warningMessages, [warningType]: messages };
    };
    clearWarningMessages = (warningType: CourseSearchWarningType) => {
        this.warningMessages = { ...this.warningMessages, [warningType]: [] };
    };
}

const store = new RightPaneStore();
export default store;
