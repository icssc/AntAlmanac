export function removeGoogleIdPrefix(prefixedGoogleId: string) {
    return prefixedGoogleId.replace('google_', '');
}
