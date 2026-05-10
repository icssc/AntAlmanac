/**
 * Extracts the acronym inside the first pair of parentheses in a UCI building display name.
 * Falls back to an empty string when parentheses are missing or malformed (matches prior
 * `substring` behavior for invalid indices).
 */
export function getBuildingNameAcronym(name: string): string {
    const open = name.indexOf('(');
    const close = name.indexOf(')');
    if (open === -1 || close === -1 || close <= open) {
        return '';
    }
    return name.substring(open + 1, close);
}
