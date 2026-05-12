import type { WebsocSection, WebsocSectionType } from '@packages/anteater-api/types';

export type notifyOn = {
    notifyOnOpen: boolean;
    notifyOnWaitlist: boolean;
    notifyOnFull: boolean;
    notifyOnRestriction: boolean;
};

export type Notification = {
    term: string;
    sectionCode: string;
    courseTitle: string;
    sectionType: WebsocSectionType;
    notifyOn: notifyOn;
    lastUpdatedStatus: WebsocSection['status'] | null;
    lastCodes: string;
};
