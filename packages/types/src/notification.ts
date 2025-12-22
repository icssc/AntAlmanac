export type NotificationStatus = {
    openStatus: boolean;
    waitlistStatus: boolean;
    fullStatus: boolean;
    restrictionStatus: boolean;
};

export type Notification = {
    term: string;
    sectionCode: string;
    courseTitle: string;
    sectionType: string;
    notificationStatus: NotificationStatus;
    lastUpdatedStatus: string;
    lastCodes: string;
};
