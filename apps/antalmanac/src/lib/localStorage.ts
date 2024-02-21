export enum LocalStorageKeys {
    userId = 'userID' /* The case-difference is due to the original implementation */,
}

export function setLocalStorageItem(key: LocalStorageKeys, value: string) {
    window.localStorage.setItem(key, value);
}

export function getLocalStorageItem(key: LocalStorageKeys) {
    return window.localStorage.getItem(key);
}

export function removeLocalStorageItem(key: LocalStorageKeys) {
    window.localStorage.removeItem(key);
}
