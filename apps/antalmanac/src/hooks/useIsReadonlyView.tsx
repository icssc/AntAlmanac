import { useIsSharedSchedulePage } from '$hooks/useIsSharedSchedulePage';

/**
 * @returns true if the user should not be able to edit/delete anything, false otherwise.
 */
export function useIsReadonlyView() {
    return useIsSharedSchedulePage();
}
