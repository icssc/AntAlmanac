import type { Division, Quarter } from '@packages/antalmanac-types';
import { create } from 'zustand';

/**
 * A single filter set inside the Grade Explorer.
 *
 * Multiple queries can be active simultaneously so advisors can compare
 * distributions side-by-side (e.g. "CS 161 with Prof X" vs "CS 161 with
 * Prof Y" vs "CS 161 dept-wide").
 */
export interface GradeQuery {
    id: number;
    /** Display label for chips + chart legend. Auto-derived if empty. */
    label?: string;
    department?: string;
    courseNumber?: string;
    instructor?: string;
    sectionCode?: string;
    year?: string;
    quarter?: Quarter;
    division?: Division;
}

export type ExplorerTab = 'distribution' | 'trend' | 'benchmark' | 'details';

export interface GradeExplorerPreset {
    kind: 'section' | 'empty';
    department?: string;
    courseNumber?: string;
    instructor?: string;
}

export type ExplorerPresetAction =
    | 'allInstructorsForCourse'
    | 'instructorAcrossCourses'
    | 'yearOverYear'
    | 'instructorVsDept';

interface GradeExplorerState {
    open: boolean;
    activeTab: ExplorerTab;
    activeQueryId: number | null;
    queries: GradeQuery[];
    nextId: number;
    excludePNP: boolean;
    excludeCOVID: boolean;

    openModal: (preset?: GradeExplorerPreset) => void;
    closeModal: () => void;
    setActiveTab: (tab: ExplorerTab) => void;
    setActiveQuery: (id: number) => void;
    addQuery: (seed?: Partial<Omit<GradeQuery, 'id'>>) => void;
    removeQuery: (id: number) => void;
    updateQuery: (id: number, patch: Partial<Omit<GradeQuery, 'id'>>) => void;
    replaceQueries: (queries: Array<Partial<Omit<GradeQuery, 'id'>>>, activeTab?: ExplorerTab) => void;
    resetQueries: () => void;
    setExcludePNP: (value: boolean) => void;
    setExcludeCOVID: (value: boolean) => void;
}

/** Teal → lime ramp, matching the Zotistics beta multi-query palette. */
export const QUERY_COLORS = ['#22577A', '#38A3A5', '#57CC99', '#80ED99', '#C7F9CC'];

/** Maximum number of comparison queries shown in the stack. */
export const MAX_QUERIES = 4;

/**
 * Quarters UCI graded on Pass/No Pass only or that advisors commonly want
 * to exclude when looking at historical trends. Matches the Zotistics
 * "Exclude COVID-19" list.
 */
export const COVID_QUARTER_KEYS = new Set<string>([
    '2020-Winter',
    '2020-Spring',
    '2020-Summer1',
    '2020-Summer10wk',
    '2020-Summer2',
    '2020-Fall',
    '2021-Winter',
    '2021-Spring',
    '2021-Summer1',
    '2021-Summer10wk',
    '2021-Summer2',
]);

export function isCovidSection(year: string, quarter: string): boolean {
    return COVID_QUARTER_KEYS.has(`${year}-${quarter}`);
}

export function colorForIndex(index: number): string {
    return QUERY_COLORS[index % QUERY_COLORS.length];
}

/** Derives a short label from a query's non-empty filters. */
export function deriveQueryLabel(query: GradeQuery): string {
    if (query.label && query.label.trim()) return query.label;
    const parts: string[] = [];
    if (query.department) parts.push(query.department.toUpperCase());
    if (query.courseNumber) parts.push(query.courseNumber);
    if (query.instructor) parts.push(query.instructor);
    if (query.year) parts.push(query.year);
    if (query.quarter) parts.push(query.quarter);
    if (query.sectionCode) parts.push(`#${query.sectionCode}`);
    return parts.length ? parts.join(' · ') : 'New query';
}

function buildSeedQueries(preset?: GradeExplorerPreset): GradeQuery[] {
    if (preset?.kind === 'section') {
        return [
            {
                id: 1,
                department: preset.department,
                courseNumber: preset.courseNumber,
                instructor: preset.instructor,
            },
        ];
    }
    return [{ id: 1 }];
}

export const useGradeExplorerStore = create<GradeExplorerState>((set, get) => ({
    open: false,
    activeTab: 'distribution',
    activeQueryId: 1,
    queries: [{ id: 1 }],
    nextId: 2,
    excludePNP: false,
    excludeCOVID: false,

    openModal: (preset) => {
        const queries = buildSeedQueries(preset);
        set({
            open: true,
            queries,
            activeQueryId: queries[0]?.id ?? null,
            nextId: (queries.at(-1)?.id ?? 0) + 1,
            activeTab: 'distribution',
        });
    },

    closeModal: () => set({ open: false }),

    setActiveTab: (activeTab) => set({ activeTab }),

    setActiveQuery: (id) => set({ activeQueryId: id }),

    addQuery: (seed) => {
        const { queries, nextId } = get();
        if (queries.length >= MAX_QUERIES) return;
        const newQuery: GradeQuery = { id: nextId, ...seed };
        set({
            queries: [...queries, newQuery],
            activeQueryId: nextId,
            nextId: nextId + 1,
        });
    },

    removeQuery: (id) => {
        const { queries, activeQueryId } = get();
        if (queries.length <= 1) return;
        const next = queries.filter((q) => q.id !== id);
        set({
            queries: next,
            activeQueryId: activeQueryId === id ? (next[0]?.id ?? null) : activeQueryId,
        });
    },

    updateQuery: (id, patch) => {
        set((state) => ({
            queries: state.queries.map((q) => (q.id === id ? { ...q, ...patch } : q)),
        }));
    },

    replaceQueries: (queries, activeTab) => {
        const capped = queries.slice(0, MAX_QUERIES);
        const idStart = get().nextId;
        const withIds: GradeQuery[] = capped.map((q, i) => ({ id: idStart + i, ...q }));
        set({
            queries: withIds.length ? withIds : [{ id: idStart }],
            activeQueryId: withIds[0]?.id ?? idStart,
            nextId: idStart + Math.max(withIds.length, 1),
            ...(activeTab ? { activeTab } : {}),
        });
    },

    resetQueries: () => set({ queries: [{ id: 1 }], activeQueryId: 1, nextId: 2 }),

    setExcludePNP: (value) => set({ excludePNP: value }),
    setExcludeCOVID: (value) => set({ excludeCOVID: value }),
}));

/**
 * Convenience: open the Grade Explorer from anywhere without needing to
 * subscribe to the store (e.g. from an event handler).
 */
export function openGradeExplorer(preset?: GradeExplorerPreset): void {
    useGradeExplorerStore.getState().openModal(preset);
}
