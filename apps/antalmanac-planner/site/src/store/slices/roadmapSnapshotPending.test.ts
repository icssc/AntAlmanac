import reducer, {
    createQuarterCourseLoadingPlaceholder,
    redoRoadmapRevision,
    reviseRoadmap,
    setCHCSelection,
    setInitialPlannerData,
    setPlanIndex,
    setSnapshotPending,
    undoRoadmapRevision,
} from './roadmapSlice';

const plans = [{ id: 1, name: 'Plan', chc: '' as const, content: { yearPlans: [], invalidCourses: [] } }];
const loaded = reducer(undefined, setInitialPlannerData({ plans, timestamp: 1 }));

// Two revisions, currently at the second, with one undone and ready to redo: undo and redo both have work to do
// whenever the snapshot guard is absent.
const withHistory = [reviseRoadmap({ timestamp: 2, edits: [] }), reviseRoadmap({ timestamp: 3, edits: [] })].reduce(
    reducer,
    loaded
);
const undone = reducer(withHistory, undoRoadmapRevision());

it('has real history to undo and redo in the fixtures (so the guard tests below can fail)', () => {
    expect(withHistory.currentRevisionIndex).toBe(2);
    expect(undone.currentRevisionIndex).toBe(1);
    expect(reducer(undone, redoRoadmapRevision()).currentRevisionIndex).toBe(2);
});

it('ignores edits, undo/redo and CHC changes while the roadmap is only a snapshot', () => {
    const pending = reducer(undone, setSnapshotPending(true));
    const before = JSON.stringify(pending);

    expect(reducer(pending, reviseRoadmap({ timestamp: 4, edits: [] })).revisions).toHaveLength(3);
    expect(reducer(pending, undoRoadmapRevision()).currentRevisionIndex).toBe(1);
    expect(reducer(pending, redoRoadmapRevision()).currentRevisionIndex).toBe(1);

    let state = pending;
    state = reducer(state, reviseRoadmap({ timestamp: 4, edits: [] }));
    state = reducer(state, undoRoadmapRevision());
    state = reducer(state, redoRoadmapRevision());
    state = reducer(state, setCHCSelection({ plannerId: 1, chc: 'CHC4' }));
    state = reducer(state, createQuarterCourseLoadingPlaceholder({ yearIndex: 0, quarterIndex: 0, courseIndex: 0 }));
    expect(JSON.stringify(state)).toBe(before);
});

it('accepts edits, undo and redo again once the server copy has replaced the snapshot', () => {
    let state = reducer(undone, setSnapshotPending(true));
    state = reducer(state, setSnapshotPending(false));
    expect(reducer(state, redoRoadmapRevision()).currentRevisionIndex).toBe(2);
    expect(reducer(state, undoRoadmapRevision()).currentRevisionIndex).toBe(0);
    expect(reducer(state, reviseRoadmap({ timestamp: 4, edits: [] })).currentRevisionIndex).toBe(2);
});

it('keeps the plan index in range when the plan a caller meant to select was never created', () => {
    // e.g. duplicating a plan during the snapshot window: the revision is ignored, then the caller selects plans.length
    expect(reducer(loaded, setPlanIndex(plans.length)).currentPlanIndex).toBe(0);
    expect(reducer(loaded, setPlanIndex(-3)).currentPlanIndex).toBe(0);
    expect(reducer(loaded, setPlanIndex(0)).currentPlanIndex).toBe(0);
});
