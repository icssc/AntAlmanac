import type { WebsocSection, WebsocSectionType } from '@packages/anteater-api/types';

import type { AATerm } from './calendar';

export type notifyOn = {
    notifyOnOpen: boolean;
    notifyOnWaitlist: boolean;
    notifyOnFull: boolean;
    notifyOnRestriction: boolean;
};

export type Notification = {
    year: AATerm['year'];
    quarter: AATerm['quarter'];
    sectionCode: string;
    courseTitle: string;
    sectionType: WebsocSectionType;
    notifyOn: notifyOn;
    lastUpdatedStatus: WebsocSection['status'] | null;
    lastCodes: string;
};
