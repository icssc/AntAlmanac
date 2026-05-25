enum LocalStorageKeys {
    /* The case-difference is due to the original implementation */
    userId = 'userID',
    patchNotesKey = 'latestPatchSeen',
    recruitmentDismissalTime = 'recruitmentDismissalTime',
    recentlySearched = 'recentlySearched',
    tourHasRun = 'tourHasRun',
    theme = 'theme',
    show24HourTime = 'show24HourTime',
    previewMode = 'previewMode',
    autoSave = 'autoSave',
    devMode = 'devMode',
    unsavedActions = 'unsavedActions',
    columnToggles = 'columnToggles',
    /** @deprecated Removed with the PWA install banner in PR #1678; the banner had already been disabled in PR #1213. Key retained for stale client data. */
    pwaDismissalTime = 'pwaDismissalTime',
    /** @deprecated Session token is now stored in an HttpOnly cookie (aa_session). */
    sessionId = 'sessionId',
    wasLoggedIn = 'wasLoggedIn',
    dataCache = 'dataCache',
    /** @deprecated As part of migration to better auth */
    newUser = 'newUser',
    importedUser = 'importedUser',
    /** @deprecated As part of migration to better auth */
    fromLoading = 'fromLoading',
    tempSaveData = 'tempSaveData',
    skeletonBlueprint = 'skeletonBlueprint',
    addedCoursesSkeletonBlueprint = 'addedCoursesSkeletonBlueprint',
}

const LSK = LocalStorageKeys;

export function setLocalStorageImportedUser(value: string) {
    window.localStorage.setItem(LSK.importedUser, value);
}

export function getLocalStorageImportedUser() {
    return window.localStorage.getItem(LSK.importedUser);
}

export function removeLocalStorageImportedUser() {
    window.localStorage.removeItem(LSK.importedUser);
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

export function getWasLoggedIn(): boolean {
    return window.localStorage.getItem(LSK.wasLoggedIn) === 'true';
}

export function setWasLoggedIn(value: boolean) {
    if (value) {
        window.localStorage.setItem(LSK.wasLoggedIn, 'true');
    } else {
        window.localStorage.removeItem(LSK.wasLoggedIn);
    }
}

// Helper functions for patchNotesKey
export function setLocalStoragePatchNotesKey(value: string) {
    window.localStorage.setItem(LSK.patchNotesKey, value);
}

export function getLocalStoragePatchNotesKey() {
    return window.localStorage.getItem(LSK.patchNotesKey);
}

// Helper functions for recruitmentDismissalTime
export function setLocalStorageRecruitmentDismissalTime(value: string) {
    window.localStorage.setItem(LSK.recruitmentDismissalTime, value);
}

export function getLocalStorageRecruitmentDismissalTime() {
    return window.localStorage.getItem(LSK.recruitmentDismissalTime);
}

// Helper functions for recently searched
export function setLocalStorageRecentlySearched(value: string) {
    window.localStorage.setItem(LSK.recentlySearched, value);
}

export function getLocalStorageRecentlySearched() {
    return window.localStorage.getItem(LSK.recentlySearched);
}

// Helper functions for tourHasRun
export function setLocalStorageTourHasRun(value: string) {
    window.localStorage.setItem(LSK.tourHasRun, value);
}

export function getLocalStorageTourHasRun() {
    return window.localStorage.getItem(LSK.tourHasRun);
}

// Helper functions for theme
export function setLocalStorageTheme(value: string) {
    window.localStorage.setItem(LSK.theme, value);
}

export function getLocalStorageTheme() {
    return window.localStorage.getItem(LSK.theme);
}

// Helper functions for show24HourTime
export function setLocalStorageShow24HourTime(value: string) {
    window.localStorage.setItem(LSK.show24HourTime, value);
}

export function getLocalStorageShow24HourTime() {
    return window.localStorage.getItem(LSK.show24HourTime);
}

// Helper functions for previewMode
export function setLocalStoragePreviewMode(value: string) {
    window.localStorage.setItem(LSK.previewMode, value);
}

export function getLocalStoragePreviewMode() {
    return window.localStorage.getItem(LSK.previewMode);
}

// Helper functions for autoSave
export function setLocalStorageAutoSave(value: string) {
    window.localStorage.setItem(LSK.autoSave, value);
}

export function getLocalStorageAutoSave() {
    return window.localStorage.getItem(LSK.autoSave);
}

// Helper functions for devMode
export function setLocalStorageDevMode(value: string) {
    localStorage.setItem(LocalStorageKeys.devMode, value);
}

export function getLocalStorageDevMode() {
    return localStorage.getItem(LocalStorageKeys.devMode);
}

export function removeLocalStorageUnsavedActions() {
    window.localStorage.removeItem(LSK.unsavedActions);
}

// Helper functions for columnToggles
export function setLocalStorageColumnToggles(value: string) {
    window.localStorage.setItem(LSK.columnToggles, value);
}

export function getLocalStorageColumnToggles() {
    return window.localStorage.getItem(LSK.columnToggles);
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

export function setLocalStorageSkeletonBlueprint(value: string) {
    window.localStorage.setItem(LSK.skeletonBlueprint, value);
}

export function getLocalStorageSkeletonBlueprint() {
    return window.localStorage.getItem(LSK.skeletonBlueprint);
}

export function removeLocalStorageSkeletonBlueprint() {
    window.localStorage.removeItem(LSK.skeletonBlueprint);
}

export function setLocalStorageAddedCoursesSkeletonBlueprint(value: string) {
    window.localStorage.setItem(LSK.addedCoursesSkeletonBlueprint, value);
}

export function getLocalStorageAddedCoursesSkeletonBlueprint() {
    return window.localStorage.getItem(LSK.addedCoursesSkeletonBlueprint);
}

export function removeLocalStorageAddedCoursesSkeletonBlueprint() {
    window.localStorage.removeItem(LSK.addedCoursesSkeletonBlueprint);
}
