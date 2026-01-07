enum LocalStorageKeys {
    /* The case-difference is due to the original implementation */
    userId = 'userID',
    patchNotesKey = 'latestPatchSeen',
    phoneNumber = 'phoneNumber',
    recruitmentDismissalTime = 'recruitmentDismissalTime',
    advanced = 'advanced',
    recentlySearched = 'recentlySearched',
    tourHasRun = 'tourHasRun',
    theme = 'theme',
    show24HourTime = 'show24HourTime',
    previewMode = 'previewMode',
    autoSave = 'autoSave',
    unsavedActions = 'unsavedActions',
    helpBoxDismissalTime = 'helpBoxDismissalTime',
    columnToggles = 'columnToggles',
    pwaDismissalTime = 'pwaDismissalTime',
    sessionId = 'sessionId',
    dataCache = 'dataCache',
    newUser = 'newUser',
    importedUser = 'importedUser',
    fromLoading = 'fromLoading',
    tempSaveData = 'tempSaveData',
}

const LSK = LocalStorageKeys;

export function setLocalStorageFromLoading(value: string) {
    window.localStorage.setItem(LSK.fromLoading, value);
}

export function getLocalStorageFromLoading() {
    return window.localStorage.getItem(LSK.fromLoading);
}

export function removeLocalStorageFromLoading() {
    window.localStorage.removeItem(LSK.fromLoading);
}

export function setLocalStorageImportedUser(value: string) {
    window.localStorage.setItem(LSK.importedUser, value);
}

export function getLocalStorageImportedUser() {
    return window.localStorage.getItem(LSK.importedUser);
}

export function removeLocalStorageImportedUser() {
    window.localStorage.removeItem(LSK.importedUser);
}

export function setLocalStorageOnFirstSignin(value: string) {
    window.localStorage.setItem(LSK.newUser, value);
}

export function getLocalStorageOnFirstSignin() {
    return window.localStorage.getItem(LSK.newUser);
}

export function removeLocalStorageOnFirstSignin() {
    window.localStorage.removeItem(LSK.newUser);
}

export function setLocalStorageDataCache(value: string) {
    window.localStorage.setItem(LSK.dataCache, value);
}

export function getLocalStorageDataCache() {
    return window.localStorage.getItem(LSK.dataCache);
}

export function removeLocalStorageDataCache() {
    window.localStorage.removeItem(LSK.dataCache);
}

export function setLocalStorageUserId(value: string) {
    window.localStorage.setItem(LSK.userId, value);
}

export function getLocalStorageUserId() {
    return window.localStorage.getItem(LSK.userId);
}

export function removeLocalStorageUserId() {
    window.localStorage.removeItem(LSK.userId);
}

export function setLocalStorageSessionId(value: string) {
    window.localStorage.setItem(LSK.sessionId, value);
}

export function getLocalStorageSessionId() {
    return window.localStorage.getItem(LSK.sessionId);
}

export function removeLocalStorageSessionId() {
    window.localStorage.removeItem(LSK.sessionId);
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

// Helper functions for recently searched
export function setLocalStorageRecentlySearched(value: string) {
    window.localStorage.setItem(LSK.recentlySearched, value);
}

export function getLocalStorageRecentlySearched() {
    return window.localStorage.getItem(LSK.recentlySearched);
}

export function removeLocalStorageRecentlySearched() {
    window.localStorage.removeItem(LSK.recentlySearched);
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

// Helper functions for autoSave
export function setLocalStorageAutoSave(value: string) {
    window.localStorage.setItem(LSK.autoSave, value);
}

export function getLocalStorageAutoSave() {
    return window.localStorage.getItem(LSK.autoSave);
}

export function removeLocalStorageAutoSave() {
    window.localStorage.removeItem(LSK.autoSave);
}

// Helper functions for autoSave
export function setLocalStorageUnsavedActions(value: string) {
    window.localStorage.setItem(LSK.unsavedActions, value);
}

export function getLocalStorageUnsavedActions() {
    return window.localStorage.getItem(LSK.unsavedActions);
}

export function removeLocalStorageUnsavedActions() {
    window.localStorage.removeItem(LSK.unsavedActions);
}

// Helper functions for helpBoxDismissalTime
export function setLocalStorageHelpBoxDismissalTime(value: string) {
    window.localStorage.setItem(LSK.helpBoxDismissalTime, value);
}

export function getLocalStorageHelpBoxDismissalTime() {
    return window.localStorage.getItem(LSK.helpBoxDismissalTime);
}

export function removeLocalStorageHelpBoxDismissalTime() {
    window.localStorage.removeItem(LSK.helpBoxDismissalTime);
}

// Helper functions for columnToggles
export function setLocalStorageColumnToggles(value: string) {
    window.localStorage.setItem(LSK.columnToggles, value);
}

export function getLocalStorageColumnToggles() {
    return window.localStorage.getItem(LSK.columnToggles);
}

// Helper functions for pwaDismissalTime
export function setLocalStoragePWADismissalTime(value: string) {
    window.localStorage.setItem(LSK.pwaDismissalTime, value);
}

export function getLocalStoragePWADismissalTime() {
    return window.localStorage.getItem(LSK.pwaDismissalTime);
}

export function setLocalStorageTempSaveData(value: string) {
    window.localStorage.setItem(LSK.tempSaveData, value);
}

export function getLocalStorageTempSaveData() {
    return window.localStorage.getItem(LSK.tempSaveData);
}

export function removeLocalStorageTempSaveData() {
    window.localStorage.removeItem(LSK.tempSaveData);
}
