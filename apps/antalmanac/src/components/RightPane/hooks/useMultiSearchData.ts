import RightPaneStore, { MULTI_SEARCH_DATA_CHANGE } from '$components/RightPane/RightPaneStore';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import { useSyncExternalStore } from 'react';

export function useMultiSearchData(): CourseSearchParams[] {
    return useSyncExternalStore(
        (onStoreChange) => {
            RightPaneStore.on(MULTI_SEARCH_DATA_CHANGE, onStoreChange);
            return () => RightPaneStore.off(MULTI_SEARCH_DATA_CHANGE, onStoreChange);
        },
        () => RightPaneStore.getMultiSearchData(),
        () => RightPaneStore.getMultiSearchData()
    );
}
