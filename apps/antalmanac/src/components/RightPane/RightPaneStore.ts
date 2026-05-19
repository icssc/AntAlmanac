import { EventEmitter } from 'events';

import {
    courseSearchFormDataHasAdvancedSearch,
    courseSearchFormDataIsValid,
    type CourseSearchField,
    type CourseSearchParams,
    defaultCourseSearchFormValues,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import type { AATerm } from '@packages/antalmanac-types';
export type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchForm/searchParams';

type SearchParamKey = CourseSearchField;

export enum CourseSearchWarningType {
    TermUnavailable = 'termUnavailable',
}

class RightPaneStore extends EventEmitter {
    private formData: CourseSearchParams;
    private prevFormData?: CourseSearchParams;
    private multiSearchData: CourseSearchParams[];
    private warningMessages: Record<CourseSearchWarningType, string[]>;

    constructor() {
        super();
        this.setMaxListeners(15);
        this.formData = structuredClone(defaultCourseSearchFormValues);
        this.multiSearchData = [];
        this.warningMessages = { [CourseSearchWarningType.TermUnavailable]: [] };
    }

    getFormData = () => {
        return this.formData;
    };

    getDefaultFormData = () => {
        return defaultCourseSearchFormValues;
    };

    getMultiSearchData = () => this.multiSearchData;

    getWarningMessages = () => this.warningMessages;

    setFormData = (formData: CourseSearchParams) => {
        this.formData = structuredClone(formData);
        this.emit('formDataChange');
    };

    updateFormValue = <Field extends SearchParamKey>(field: Field, value: CourseSearchParams[Field]) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    setTerm = (term: AATerm) => {
        this.formData.term = term;
        this.emit('formDataChange');
    };

    setMultiSearchData = (data: Partial<(typeof this.multiSearchData)[number]>[]) => {
        this.multiSearchData = data.map((params) => ({
            ...defaultCourseSearchFormValues,
            ...params,
            term: this.formData.term,
        }));
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
        this.formData = structuredClone(defaultCourseSearchFormValues);
        this.emit('formReset');
    };

    formDataIsValid = () => {
        return courseSearchFormDataIsValid(this.formData);
    };

    formDataHasAdvancedSearch = () => {
        return courseSearchFormDataHasAdvancedSearch(this.formData);
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
