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

    /** @deprecated Guest import confirmation now uses a snackbar in AuthInitializer. */
    importedUser = 'importedUser',
    /** @deprecated Theme preference is now managed by MUI via modeStorageKey="theme". */
    theme = 'theme',
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

function getStorage(): Storage | undefined {
    if (typeof window !== 'undefined') {
        return window.localStorage;
    }
}

export function setLocalStorageDataCache(value: string) {
    getStorage()?.setItem(LSK.dataCache, value);
}

export function getLocalStorageDataCache() {
    return getStorage()?.getItem(LSK.dataCache) ?? null;
}

export function removeLocalStorageDataCache() {
    getStorage()?.removeItem(LSK.dataCache);
}

export function setLocalStorageUserId(value: string) {
    getStorage()?.setItem(LSK.userId, value);
}

export function getLocalStorageUserId() {
    return getStorage()?.getItem(LSK.userId) ?? null;
}

export function removeLocalStorageUserId() {
    getStorage()?.removeItem(LSK.userId);
}

export function getWasLoggedIn(): boolean {
    return getStorage()?.getItem(LSK.wasLoggedIn) === 'true';
}

export function setWasLoggedIn(value: boolean) {
    if (value) {
        getStorage()?.setItem(LSK.wasLoggedIn, 'true');
    } else {
        getStorage()?.removeItem(LSK.wasLoggedIn);
    }
}

// Helper functions for patchNotesKey
export function setLocalStoragePatchNotesKey(value: string) {
    getStorage()?.setItem(LSK.patchNotesKey, value);
}

export function getLocalStoragePatchNotesKey() {
    return getStorage()?.getItem(LSK.patchNotesKey) ?? null;
}

// Helper functions for recruitmentDismissalTime
export function setLocalStorageRecruitmentDismissalTime(value: string) {
    getStorage()?.setItem(LSK.recruitmentDismissalTime, value);
}

export function getLocalStorageRecruitmentDismissalTime() {
    return getStorage()?.getItem(LSK.recruitmentDismissalTime) ?? null;
}

// Helper functions for tourHasRun
export function setLocalStorageTourHasRun(value: string) {
    getStorage()?.setItem(LSK.tourHasRun, value);
}

export function getLocalStorageTourHasRun() {
    return getStorage()?.getItem(LSK.tourHasRun) ?? null;
}

// Helper functions for sectionColor
export function setLocalStorageSectionColor(value: string) {
    getStorage()?.setItem(LSK.sectionColor, value);
}

export function getLocalStorageSectionColor() {
    return getStorage()?.getItem(LSK.sectionColor) ?? null;
}

// Helper functions for sectionColorAssignments
export function setLocalStorageSectionColorAssignments(value: string) {
    getStorage()?.setItem(LSK.sectionColorAssignments, value);
}

export function getLocalStorageSectionColorAssignments() {
    return getStorage()?.getItem(LSK.sectionColorAssignments) ?? null;
}

// Helper functions for show24HourTime
export function setLocalStorageShow24HourTime(value: string) {
    getStorage()?.setItem(LSK.show24HourTime, value);
}

export function getLocalStorageShow24HourTime() {
    return getStorage()?.getItem(LSK.show24HourTime) ?? null;
}

// Helper functions for previewMode
export function setLocalStoragePreviewMode(value: string) {
    getStorage()?.setItem(LSK.previewMode, value);
}

export function getLocalStoragePreviewMode() {
    return getStorage()?.getItem(LSK.previewMode) ?? null;
}

// Helper functions for autoSave
export function setLocalStorageAutoSave(value: string) {
    getStorage()?.setItem(LSK.autoSave, value);
}

export function getLocalStorageAutoSave() {
    return getStorage()?.getItem(LSK.autoSave) ?? null;
}

// Helper functions for devMode
export function setLocalStorageDevMode(value: string) {
    getStorage()?.setItem(LSK.devMode, value);
}

export function getLocalStorageDevMode() {
    return getStorage()?.getItem(LSK.devMode) ?? null;
}

// Helper functions for columnToggles
export function setLocalStorageColumnToggles(value: string) {
    getStorage()?.setItem(LSK.columnToggles, value);
}

export function getLocalStorageColumnToggles() {
    return getStorage()?.getItem(LSK.columnToggles) ?? null;
}

export function setLocalStorageTempSaveData(value: string) {
    getStorage()?.setItem(LSK.tempSaveData, value);
}

export function getLocalStorageTempSaveData() {
    return getStorage()?.getItem(LSK.tempSaveData) ?? null;
}

export function removeLocalStorageTempSaveData() {
    getStorage()?.removeItem(LSK.tempSaveData);
}

export function setLocalStorageSkeletonBlueprint(value: string) {
    getStorage()?.setItem(LSK.skeletonBlueprint, value);
}

export function getLocalStorageSkeletonBlueprint() {
    return getStorage()?.getItem(LSK.skeletonBlueprint) ?? null;
}

export function removeLocalStorageSkeletonBlueprint() {
    getStorage()?.removeItem(LSK.skeletonBlueprint);
}

export function setLocalStorageAddedCoursesSkeletonBlueprint(value: string) {
    getStorage()?.setItem(LSK.addedCoursesSkeletonBlueprint, value);
}

export function getLocalStorageAddedCoursesSkeletonBlueprint() {
    return getStorage()?.getItem(LSK.addedCoursesSkeletonBlueprint) ?? null;
}

export function removeLocalStorageAddedCoursesSkeletonBlueprint() {
    getStorage()?.removeItem(LSK.addedCoursesSkeletonBlueprint);
}
