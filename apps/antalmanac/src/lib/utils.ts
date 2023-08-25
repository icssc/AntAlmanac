export function notNull<T>(value: T): value is NonNullable<T> {
    return value != null;
}

/**
 * Given a reference array and an input, generate an array of booleans for each position in the
 * reference array, indicating whether the value at that position is in the input.
 */
export function getReferencesOccurring(reference: string[], input?: string | string[] | null): boolean[] {
    return input ? reference.map((reference) => input.includes(reference)) : reference.map(() => false);
}
