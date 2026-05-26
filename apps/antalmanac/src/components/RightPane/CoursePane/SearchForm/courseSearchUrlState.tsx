'use client';

import {
    useCourseSearchUrlStateValue,
    type CourseSearchField,
    type CourseSearchParams,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { createContext, useCallback, useContext, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { shallow } from 'zustand/shallow';

export type CourseSearchUrlState = ReturnType<typeof useCourseSearchUrlStateValue>;

/** Pick one URL-backed form field; use with `useCourseSearchUrlState` for shallow subscriptions. */
export const selectFormField =
    <K extends CourseSearchField>(field: K) =>
    (state: CourseSearchUrlState): CourseSearchParams[K] =>
        state.formData[field];

function shallowEqual<A, B>(a: A, b: B): boolean {
    if (Object.is(a, b)) {
        return true;
    }
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
    }
    return shallow(a as object, b as object);
}

type StoreApi = {
    subscribe: (listener: () => void) => () => void;
    getState: () => CourseSearchUrlState;
};

const CourseSearchStoreContext = createContext<StoreApi | null>(null);

export function CourseSearchUrlStateProvider({ children }: { children: ReactNode }) {
    const state = useCourseSearchUrlStateValue();
    const stateRef = useRef(state);
    stateRef.current = state;

    const listenersRef = useRef(new Set<() => void>());
    const apiRef = useRef<StoreApi | undefined>(undefined);

    if (!apiRef.current) {
        apiRef.current = {
            subscribe: (listener) => {
                listenersRef.current.add(listener);
                return () => listenersRef.current.delete(listener);
            },
            getState: () => stateRef.current,
        };
    }

    const prevStateRef = useRef(state);
    if (prevStateRef.current !== state) {
        prevStateRef.current = state;
        listenersRef.current.forEach((listener) => listener());
    }

    return <CourseSearchStoreContext.Provider value={apiRef.current}>{children}</CourseSearchStoreContext.Provider>;
}

export function useCourseSearchUrlState(): CourseSearchUrlState;
export function useCourseSearchUrlState<T>(selector: (state: CourseSearchUrlState) => T): T;
export function useCourseSearchUrlState<T>(selector?: (state: CourseSearchUrlState) => T): CourseSearchUrlState | T {
    const store = useContext(CourseSearchStoreContext);
    if (!store) {
        throw new Error('useCourseSearchUrlState must be used within CourseSearchUrlStateProvider');
    }

    if (!selector) {
        return useSyncExternalStore(store.subscribe, store.getState, store.getState);
    }

    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    const snapshotRef = useRef<T | undefined>(undefined);

    const getSnapshot = useCallback(() => {
        const next = selectorRef.current(store.getState());
        const prev = snapshotRef.current;
        if (prev !== undefined && shallowEqual(prev, next)) {
            return prev;
        }
        snapshotRef.current = next;
        return next;
    }, [store]);

    return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
