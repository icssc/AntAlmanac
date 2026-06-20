enum LocalStorageKeys {
    /* The case-difference is due to the original implementation */
    userId = 'userID',
    patchNotesKey = 'latestPatchSeen',
    recruitmentDismissalTime = 'recruitmentDismissalTime',
    tourHasRun = 'tourHasRun',
    sectionColor = 'sectionColor',
    sectionColorAssignments = 'sectionColorAssignments',
    show24HourTime = 'show24HourTime',
    previewMode = 'previewMode',
    autoSave = 'autoSave',
    devMode = 'devMode',
    columnToggles = 'columnToggles',
    wasLoggedIn = 'wasLoggedIn',
    dataCache = 'dataCache',
    tempSaveData = 'tempSaveData',
    skeletonBlueprint = 'skeletonBlueprint',
    addedCoursesSkeletonBlueprint = 'addedCoursesSkeletonBlueprint',

    /** @deprecated theme is now managed by MUI and should not be written to directly */
    theme = 'theme',
    /** @deprecated Guest import confirmation now uses a snackbar in AuthInitializer. */
    importedUser = 'importedUser',
    /** @deprecated No longer used. Low impact feature. */
    recentlySearched = 'recentlySearched',
    /** @deprecated Removed for being a net negative on UX and confusing schedule persistence behavior */
    unsavedActions = 'unsavedActions',
    /** @deprecated Removed with the PWA install banner in PR #1678; the banner had already been disabled in PR #1213. Key retained for stale client data. */
    pwaDismissalTime = 'pwaDismissalTime',
    /** @deprecated Session token is now stored in an HttpOnly cookie (aa_session). */
    sessionId = 'sessionId',
    /** @deprecated As part of migration to better auth */
    newUser = 'newUser',
    /** @deprecated As part of migration to better auth */
    fromLoading = 'fromLoading',
}

const LSK = LocalStorageKeys;

function getLocalStorage(): Storage | null {
    return globalThis.window?.localStorage ?? null;
}

export function setLocalStorageImportedUser(value: string) {
    getLocalStorage()?.setItem(LSK.importedUser, value);
}

export function getLocalStorageImportedUser() {
    return getLocalStorage()?.getItem(LSK.importedUser) ?? null;
}

export function removeLocalStorageImportedUser() {
    getLocalStorage()?.removeItem(LSK.importedUser);
}

export function setLocalStorageDataCache(value: string) {
    getLocalStorage()?.setItem(LSK.dataCache, value);
}

export function getLocalStorageDataCache() {
    return getLocalStorage()?.getItem(LSK.dataCache) ?? null;
}

export function removeLocalStorageDataCache() {
    getLocalStorage()?.removeItem(LSK.dataCache);
}

export function setLocalStorageUserId(value: string) {
    getLocalStorage()?.setItem(LSK.userId, value);
}

export function getLocalStorageUserId() {
    return getLocalStorage()?.getItem(LSK.userId) ?? null;
}

export function removeLocalStorageUserId() {
    getLocalStorage()?.removeItem(LSK.userId);
}

export function getWasLoggedIn(): boolean {
    return getLocalStorage()?.getItem(LSK.wasLoggedIn) === 'true';
}

export function setWasLoggedIn(value: boolean) {
    const storage = getLocalStorage();
    if (!storage) return;

    if (value) {
        storage.setItem(LSK.wasLoggedIn, 'true');
    } else {
        storage.removeItem(LSK.wasLoggedIn);
    }
}

// Helper functions for patchNotesKey
export function setLocalStoragePatchNotesKey(value: string) {
    getLocalStorage()?.setItem(LSK.patchNotesKey, value);
}

export function getLocalStoragePatchNotesKey() {
    return getLocalStorage()?.getItem(LSK.patchNotesKey) ?? null;
}

// Helper functions for recruitmentDismissalTime
export function setLocalStorageRecruitmentDismissalTime(value: string) {
    getLocalStorage()?.setItem(LSK.recruitmentDismissalTime, value);
}

export function getLocalStorageRecruitmentDismissalTime() {
    return getLocalStorage()?.getItem(LSK.recruitmentDismissalTime) ?? null;
}

// Helper functions for tourHasRun
export function setLocalStorageTourHasRun(value: string) {
    getLocalStorage()?.setItem(LSK.tourHasRun, value);
}

export function getLocalStorageTourHasRun() {
    return getLocalStorage()?.getItem(LSK.tourHasRun) ?? null;
}

// Helper functions for sectionColor
export function setLocalStorageSectionColor(value: string) {
    getLocalStorage()?.setItem(LSK.sectionColor, value);
}

export function getLocalStorageSectionColor() {
    return getLocalStorage()?.getItem(LSK.sectionColor) ?? null;
}

// Helper functions for sectionColorAssignments
export function setLocalStorageSectionColorAssignments(value: string) {
    getLocalStorage()?.setItem(LSK.sectionColorAssignments, value);
}

export function getLocalStorageSectionColorAssignments() {
    return getLocalStorage()?.getItem(LSK.sectionColorAssignments) ?? null;
}

// Helper functions for show24HourTime
export function setLocalStorageShow24HourTime(value: string) {
    getLocalStorage()?.setItem(LSK.show24HourTime, value);
}

export function getLocalStorageShow24HourTime() {
    return getLocalStorage()?.getItem(LSK.show24HourTime) ?? null;
}

// Helper functions for previewMode
export function setLocalStoragePreviewMode(value: string) {
    getLocalStorage()?.setItem(LSK.previewMode, value);
}

export function getLocalStoragePreviewMode() {
    return getLocalStorage()?.getItem(LSK.previewMode) ?? null;
}

// Helper functions for autoSave
export function setLocalStorageAutoSave(value: string) {
    getLocalStorage()?.setItem(LSK.autoSave, value);
}

export function getLocalStorageAutoSave() {
    return getLocalStorage()?.getItem(LSK.autoSave) ?? null;
}

// Helper functions for devMode
export function setLocalStorageDevMode(value: string) {
    getLocalStorage()?.setItem(LSK.devMode, value);
}

export function getLocalStorageDevMode() {
    return getLocalStorage()?.getItem(LSK.devMode) ?? null;
}

// Helper functions for columnToggles
export function setLocalStorageColumnToggles(value: string) {
    getLocalStorage()?.setItem(LSK.columnToggles, value);
}

export function getLocalStorageColumnToggles() {
    return getLocalStorage()?.getItem(LSK.columnToggles) ?? null;
}

export function setLocalStorageTempSaveData(value: string) {
    getLocalStorage()?.setItem(LSK.tempSaveData, value);
}

export function getLocalStorageTempSaveData() {
    return getLocalStorage()?.getItem(LSK.tempSaveData) ?? null;
}

export function removeLocalStorageTempSaveData() {
    getLocalStorage()?.removeItem(LSK.tempSaveData);
}

export function setLocalStorageSkeletonBlueprint(value: string) {
    getLocalStorage()?.setItem(LSK.skeletonBlueprint, value);
}

export function getLocalStorageSkeletonBlueprint() {
    return getLocalStorage()?.getItem(LSK.skeletonBlueprint) ?? null;
}

export function removeLocalStorageSkeletonBlueprint() {
    getLocalStorage()?.removeItem(LSK.skeletonBlueprint);
}

export function setLocalStorageAddedCoursesSkeletonBlueprint(value: string) {
    getLocalStorage()?.setItem(LSK.addedCoursesSkeletonBlueprint, value);
}

export function getLocalStorageAddedCoursesSkeletonBlueprint() {
    return getLocalStorage()?.getItem(LSK.addedCoursesSkeletonBlueprint) ?? null;
}

export function removeLocalStorageAddedCoursesSkeletonBlueprint() {
    getLocalStorage()?.removeItem(LSK.addedCoursesSkeletonBlueprint);
}
