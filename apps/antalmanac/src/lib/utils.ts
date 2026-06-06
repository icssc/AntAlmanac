export function notNull<T>(value: T): value is NonNullable<T> {
    return value != null;
}

export function isNotEmpty<T>(array: T[]): array is [T, ...T[]] {
    return array.length > 0;
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
 * Can be used in conjunction with {@link notNull} to get only indices.
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
export function getReferencesOccurring(reference: readonly string[], input?: string | string[] | null): boolean[] {
    return input ? reference.map((reference) => input.includes(reference)) : reference.map(() => false);
}

export function getErrorMessage(e: unknown) {
    return e instanceof Error ? e.message : String(e);
}

/**
 * Moves an array item from one position to another, in place.
 * For an immutable alternative, see `arrayMove` from `dnd-kit`.
 *
 * @param elementMoveCount The number of elements to move. Defaults to 1.
 * @param isShiftAccountedFor Does `toIndex` already account for elements' shifting after initial removal
 * when moving elements toward the back of the array?
 * For example, `dnd-kit`'s `activeIndex` and `overIndex` do account for this shift.
 */
export function moveArrayElements(
    array: unknown[],
    fromIndex: number,
    toIndex: number,
    { elementMoveCount = 1, isShiftAccountedFor = false } = {}
) {
    const elementsToMove = array.splice(fromIndex, elementMoveCount);
    if (fromIndex < toIndex && !isShiftAccountedFor) {
        toIndex -= elementMoveCount;
    }
    array.splice(toIndex, 0, ...elementsToMove);
}
