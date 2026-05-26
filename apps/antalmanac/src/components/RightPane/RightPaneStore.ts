import { EventEmitter } from 'events';

import { defaultFormData } from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';
import type { AATerm } from '@packages/antalmanac-types';

export enum CourseSearchWarningType {
    TermUnavailable = 'termUnavailable',
}

class RightPaneStore extends EventEmitter {
    private multiSearchData: CourseSearchParams[];
    private warningMessages: Record<CourseSearchWarningType, string[]>;

    constructor() {
        super();
        this.setMaxListeners(15);
        this.multiSearchData = [];
        this.warningMessages = { [CourseSearchWarningType.TermUnavailable]: [] };
    }

    getMultiSearchData = () => this.multiSearchData;

    getWarningMessages = () => this.warningMessages;

    setMultiSearchData = (data: Partial<(typeof this.multiSearchData)[number]>[], term: AATerm) => {
        this.multiSearchData = data.map((params) => ({
            ...defaultFormData,
            ...params,
            term,
        }));
    };

    clearMultiSearchData = () => {
        this.multiSearchData = [];
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
