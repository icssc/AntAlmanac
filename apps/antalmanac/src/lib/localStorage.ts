enum LocalStorageKeys {
    /* The case-difference is due to the original implementation */
    userId = 'userID',
    patchNotesKey = 'latestPatchSeen',
    phoneNumber = 'phoneNumber',
    recruitmentDismissalTime = 'recruitmentDismissalTime',
    advanced = 'advanced',
    favorites = 'favorites',
    tourHasRun = 'tourHasRun',
    theme = 'theme',
    show24HourTime = 'show24HourTime',
    previewMode = 'previewMode',
}

const LSK = LocalStorageKeys;

// Helper functions for userId
export function setLocalStorageUserId(value: string) {
    window.localStorage.setItem(LSK.userId, value);
}

export function getLocalStorageUserId() {
    return window.localStorage.getItem(LSK.userId);
}

export function removeLocalStorageUserId() {
    window.localStorage.removeItem(LSK.userId);
}

// Helper functions for patchNotesKey
export function setLocalStoragePatchNotesKey(value: string) {
    window.localStorage.setItem(LSK.patchNotesKey, value);
}

export function getLocalStoragePatchNotesKey() {
    return window.localStorage.getItem(LSK.patchNotesKey);
}

export function removeLocalStoragePatchNotesKey() {
    window.localStorage.removeItem(LSK.patchNotesKey);
}

// Helper functions for phoneNumber
export function setLocalStoragePhoneNumber(value: string) {
    window.localStorage.setItem(LSK.phoneNumber, value);
}

export function getLocalStoragePhoneNumber() {
    return window.localStorage.getItem(LSK.phoneNumber);
}

export function removeLocalStoragePhoneNumber() {
    window.localStorage.removeItem(LSK.phoneNumber);
}

// Helper functions for recruitmentDismissalTime
export function setLocalStorageRecruitmentDismissalTime(value: string) {
    window.localStorage.setItem(LSK.recruitmentDismissalTime, value);
}

export function getLocalStorageRecruitmentDismissalTime() {
    return window.localStorage.getItem(LSK.recruitmentDismissalTime);
}

export function removeLocalStorageRecruitmentDismissalTime() {
    window.localStorage.removeItem(LSK.recruitmentDismissalTime);
}

// Helper functions for advanced
export function setLocalStorageAdvanced(value: string) {
    window.localStorage.setItem(LSK.advanced, value);
}

export function getLocalStorageAdvanced() {
    return window.localStorage.getItem(LSK.advanced);
}

export function removeLocalStorageAdvanced() {
    window.localStorage.removeItem(LSK.advanced);
}

// Helper functions for favorites
export function setLocalStorageFavorites(value: string) {
    window.localStorage.setItem(LSK.favorites, value);
}

export function getLocalStorageFavorites() {
    return window.localStorage.getItem(LSK.favorites);
}

export function removeLocalStorageFavorites() {
    window.localStorage.removeItem(LSK.favorites);
}

// Helper functions for tourHasRun
export function setLocalStorageTourHasRun(value: string) {
    window.localStorage.setItem(LSK.tourHasRun, value);
}

export function getLocalStorageTourHasRun() {
    return window.localStorage.getItem(LSK.tourHasRun);
}

export function removeLocalStorageTourHasRun() {
    window.localStorage.removeItem(LSK.tourHasRun);
}

// Helper functions for theme
export function setLocalStorageTheme(value: string) {
    window.localStorage.setItem(LSK.theme, value);
}

export function getLocalStorageTheme() {
    return window.localStorage.getItem(LSK.theme);
}

export function removeLocalStorageTheme() {
    window.localStorage.removeItem(LSK.theme);
}

// Helper functions for show24HourTime
export function setLocalStorageShow24HourTime(value: string) {
    window.localStorage.setItem(LSK.show24HourTime, value);
}

export function getLocalStorageShow24HourTime() {
    return window.localStorage.getItem(LSK.show24HourTime);
}

export function removeLocalStorageShow24HourTime() {
    window.localStorage.removeItem(LSK.show24HourTime);
}

// Helper functions for previewMode
export function setLocalStoragePreviewMode(value: string) {
    window.localStorage.setItem(LSK.previewMode, value);
}

export function getLocalStoragePreviewMode() {
    return window.localStorage.getItem(LSK.previewMode);
}

export function removeLocalStoragePreviewMode() {
    window.localStorage.removeItem(LSK.previewMode);
}
