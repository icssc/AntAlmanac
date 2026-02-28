import { useLocation } from 'react-router-dom';

/**
 * Hook to check if the current page is a shared schedule page.
 * @returns true if the current pathname starts with '/share/'
 */
export function useIsSharedSchedulePage() {
    const location = useLocation();
    return location.pathname.startsWith('/share/');
}
