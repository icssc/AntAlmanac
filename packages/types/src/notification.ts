export type NotificationStatus = {
    openStatus: boolean;
    waitlistStatus: boolean;
    fullStatus: boolean;
    restrictionStatus: boolean;
};

export type Notification = {
    term: string;
    sectionCode: number;
    courseTitle: string;
    sectionType: string;
    notificationStatus: NotificationStatus;
    lastUpdated: string;
    lastCodes: string;
};
