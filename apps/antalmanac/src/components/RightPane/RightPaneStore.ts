import { EventEmitter } from 'events';

import { DEFAULT_FORM_DATA } from '$components/RightPane/CoursePane/SearchParams/defaults';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import type { AATerm } from '@packages/antalmanac-types';

class RightPaneStore extends EventEmitter {
    private multiSearchData: CourseSearchParams[];

    constructor() {
        super();
        this.setMaxListeners(15);
        this.multiSearchData = [];
    }

    getMultiSearchData = () => this.multiSearchData;

    setMultiSearchData = (data: Partial<(typeof this.multiSearchData)[number]>[], term: AATerm) => {
        this.multiSearchData = data.map((params) => ({
            ...DEFAULT_FORM_DATA,
            ...params,
            term,
        }));
    };

    clearMultiSearchData = () => {
        this.multiSearchData = [];
    };
}

const store = new RightPaneStore();
export default store;
