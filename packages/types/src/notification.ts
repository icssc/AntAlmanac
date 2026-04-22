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
    sectionType: string;
    notifyOn: notifyOn;
    lastUpdatedStatus: string;
    lastCodes: string;
};
