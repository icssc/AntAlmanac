import { getTabHref, useTabStore, type TabName } from '$stores/TabStore';
import type { NavigateFunction } from 'react-router-dom';

let navigateFn: NavigateFunction | null = null;

export function registerTabNavigate(navigate: NavigateFunction) {
    navigateFn = navigate;
}

export function navigateToTab(name: TabName, options?: { search?: string; replace?: boolean }) {
    useTabStore.getState().setActiveTab(name);

    const pathname = getTabHref(name);
    const path = options?.search ? `${pathname}?${options.search}` : pathname;

    navigateFn?.(path, { replace: options?.replace ?? false });
}
