/**
 * Ephemeral auth/onboarding state that only needs to survive the OAuth redirect
 * (same tab). Prefer this over localStorage for handoff data between login and /auth.
 */
enum AuthSessionStorageKeys {
    pendingScheduleMerge = 'aa_pendingScheduleMerge',
    importedGuestUsername = 'aa_importedGuestUsername',
    pendingFirstSigninImport = 'aa_pendingFirstSigninImport',
    legacyGuestUserIdForImport = 'aa_legacyGuestUserIdForImport',
    previouslyLoggedIn = 'aa_previouslyLoggedIn',
}

const ASK = AuthSessionStorageKeys;

function getSessionStorage(): Storage | null {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
        return null;
    }
    return window.sessionStorage;
}

export function setPendingScheduleMerge(value: string) {
    getSessionStorage()?.setItem(ASK.pendingScheduleMerge, value);
}

export function getPendingScheduleMerge(): string | null {
    return getSessionStorage()?.getItem(ASK.pendingScheduleMerge) ?? null;
}

export function removePendingScheduleMerge() {
    getSessionStorage()?.removeItem(ASK.pendingScheduleMerge);
}

export function setImportedGuestUsername(value: string) {
    getSessionStorage()?.setItem(ASK.importedGuestUsername, value);
}

export function getImportedGuestUsername(): string | null {
    return getSessionStorage()?.getItem(ASK.importedGuestUsername) ?? null;
}

export function removeImportedGuestUsername() {
    getSessionStorage()?.removeItem(ASK.importedGuestUsername);
}

export function setPendingFirstSigninImport() {
    getSessionStorage()?.setItem(ASK.pendingFirstSigninImport, 'true');
}

export function hasPendingFirstSigninImport(): boolean {
    return getSessionStorage()?.getItem(ASK.pendingFirstSigninImport) === 'true';
}

export function removePendingFirstSigninImport() {
    getSessionStorage()?.removeItem(ASK.pendingFirstSigninImport);
}

export function setLegacyGuestUserIdForImport(value: string) {
    getSessionStorage()?.setItem(ASK.legacyGuestUserIdForImport, value);
}

export function getLegacyGuestUserIdForImport(): string | null {
    return getSessionStorage()?.getItem(ASK.legacyGuestUserIdForImport) ?? null;
}

export function removeLegacyGuestUserIdForImport() {
    getSessionStorage()?.removeItem(ASK.legacyGuestUserIdForImport);
}

export function clearAuthSessionHandoff() {
    removePendingScheduleMerge();
    removeImportedGuestUsername();
    removePendingFirstSigninImport();
    removeLegacyGuestUserIdForImport();
}

export function setPreviouslyLoggedIn(value: boolean) {
    const storage = getSessionStorage();
    if (!storage) return;
    if (value) {
        storage.setItem(ASK.previouslyLoggedIn, 'true');
    } else {
        storage.removeItem(ASK.previouslyLoggedIn);
    }
}

export function getPreviouslyLoggedIn(): boolean {
    return getSessionStorage()?.getItem(ASK.previouslyLoggedIn) === 'true';
}

/** Remove stale auth keys that previously lived in localStorage. */
export function migrateStaleAuthLocalStorageKeys() {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.localStorage.getItem('wasLoggedIn') === 'true') {
        setPreviouslyLoggedIn(true);
    }

    const staleKeys = ['fromLoading', 'dataCache', 'importedUser', 'newUser', 'wasLoggedIn'] as const;
    for (const key of staleKeys) {
        window.localStorage.removeItem(key);
    }
}
