import { useLocation } from 'react-router-dom';

/**
 * @returns true if the user should not be able to edit/delete anything, false otherwise.
 */
export function useIsReadonlyView() {
    const location = useLocation();
    return location.pathname.startsWith('/share/');
}
