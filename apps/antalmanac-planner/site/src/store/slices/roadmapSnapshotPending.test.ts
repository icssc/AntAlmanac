import reducer, {
    createQuarterCourseLoadingPlaceholder,
    redoRoadmapRevision,
    reviseRoadmap,
    setCHCSelection,
    setInitialPlannerData,
    setSnapshotPending,
    undoRoadmapRevision,
} from './roadmapSlice';

const plans = [{ id: 1, name: 'Plan', chc: '' as const, content: { yearPlans: [], invalidCourses: [] } }];
const initial = reducer(undefined, setInitialPlannerData({ plans, timestamp: 1 }));

it('ignores edits, undo/redo and CHC changes while the roadmap is only a snapshot', () => {
    let state = reducer(initial, setSnapshotPending(true));
    const before = JSON.stringify(state);
    state = reducer(state, reviseRoadmap({ timestamp: 2, edits: [] }));
    state = reducer(state, undoRoadmapRevision());
    state = reducer(state, redoRoadmapRevision());
    state = reducer(state, setCHCSelection({ plannerId: 1, chc: 'CHC4' }));
    expect(JSON.stringify(state)).toBe(before);
    expect(() =>
        reducer(state, createQuarterCourseLoadingPlaceholder({ yearIndex: 0, quarterIndex: 0, courseIndex: 0 }))
    ).not.toThrow();
});

it('accepts edits again once the server copy has replaced the snapshot', () => {
    let state = reducer(initial, setSnapshotPending(true));
    state = reducer(state, setSnapshotPending(false));
    state = reducer(state, reviseRoadmap({ timestamp: 2, edits: [] }));
    expect(state.revisions).toHaveLength(2);
    expect(state.currentRevisionIndex).toBe(1);
});
