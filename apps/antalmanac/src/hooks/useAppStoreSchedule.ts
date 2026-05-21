import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { useSyncExternalStore } from 'react';

function subscribeToScheduleIndex(onStoreChange: () => void) {
    AppStore.on('currentScheduleIndexChange', onStoreChange);
    return () => {
        AppStore.off('currentScheduleIndexChange', onStoreChange);
    };
}

export function useAppStoreScheduleIndex(): number {
    return useSyncExternalStore(
        subscribeToScheduleIndex,
        () => AppStore.getCurrentScheduleIndex(),
        () => AppStore.getCurrentScheduleIndex()
    );
}

function subscribeToCustomEvents(onStoreChange: () => void) {
    AppStore.on('customEventsChange', onStoreChange);
    AppStore.on('currentScheduleIndexChange', onStoreChange);
    return () => {
        AppStore.off('customEventsChange', onStoreChange);
        AppStore.off('currentScheduleIndexChange', onStoreChange);
    };
}

function getCurrentCustomEventsSnapshot(): RepeatingCustomEvent[] {
    const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore.getState();
    if (fallbackMode) {
        const index = AppStore.getCurrentScheduleIndex();
        return [...getCurrentFallbackSchedule(index).customEvents];
    }
    return [...AppStore.schedule.getCurrentCustomEvents()];
}

export function useCurrentCustomEvents(): RepeatingCustomEvent[] {
    return useSyncExternalStore(
        subscribeToCustomEvents,
        getCurrentCustomEventsSnapshot,
        getCurrentCustomEventsSnapshot
    );
}

function subscribeToScheduleNote(onStoreChange: () => void) {
    AppStore.on('scheduleNotesChange', onStoreChange);
    AppStore.on('currentScheduleIndexChange', onStoreChange);
    return () => {
        AppStore.off('scheduleNotesChange', onStoreChange);
        AppStore.off('currentScheduleIndexChange', onStoreChange);
    };
}

export function useScheduleNoteSnapshot(): string {
    return useSyncExternalStore(
        subscribeToScheduleNote,
        () => AppStore.getCurrentScheduleNote(),
        () => AppStore.getCurrentScheduleNote()
    );
}
