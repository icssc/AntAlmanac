export function notNull<T>(value: T): value is NonNullable<T> {
    return value != null;
}

/**
 * Given a reference array and an input, generate an array of booleans for each position in the
 * reference array, indicating whether the value at that position is in the input.
 *
 * @example
 * reference = ['a', 'b', 'c', 'd', 'e']
 * input = 'ace'
 * result = [true, false, true, false, true]
 *
 * Can be used in conjunection with {@link notNull} to get only indices.
 *
 * @example
 *
 * ```ts
 *
 * const reference = ['a', 'b', 'c', 'd', 'e'];
 * const input = 'ace';
 *
 * const occurringReferences = getReferencesOccurring(reference, input)
 * const indicesOrNull = occurringReferences.map((occurring, index) => occurring ? index : null)
 * const indices = indicesOrNull.filter(notNull)
 * ```
 */
export function getReferencesOccurring(reference: string[], input?: string | string[] | null): boolean[] {
    return input ? reference.map((reference) => input.includes(reference)) : reference.map(() => false);
}

export function getErrorMessage(e: unknown) {
    return e instanceof Error ? e.message : String(e);
}

export const safeUnreachableCase = <T>(v: never, retVal?: T): T | undefined => {
    // if this code is running, v didn't turn out to be `never` after all, so tell TS that
    const castedV = v as unknown;

    console.error(`Reached a (safe) unreachable case: ${castedV}`);
    return retVal;
};
