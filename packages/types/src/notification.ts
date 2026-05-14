import type { WebsocSection, WebsocSectionType } from '@packages/anteater-api/types';

import type { TermShortName } from './schedule';

export type notifyOn = {
    notifyOnOpen: boolean;
    notifyOnWaitlist: boolean;
    notifyOnFull: boolean;
    notifyOnRestriction: boolean;
};

export type Notification = {
    term: TermShortName;
    sectionCode: string;
    courseTitle: string;
    sectionType: WebsocSectionType;
    notifyOn: notifyOn;
    lastUpdatedStatus: WebsocSection['status'] | null;
    lastCodes: string;
};
