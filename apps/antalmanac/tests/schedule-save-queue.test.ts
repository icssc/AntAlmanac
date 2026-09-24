import { type ScheduleSaveState, VisibilityState } from '@packages/antalmanac-types';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { mutate, getCourseInfo } = vi.hoisted(() => ({
    mutate: vi.fn(),
    getCourseInfo: vi.fn(),
}));

vi.mock('$lib/api/trpc', () => ({
    trpc: {
        schedule: { save: { mutate } },
        websoc: { getCourseInfo: { query: getCourseInfo } },
    },
    trpcReact: {},
}));

vi.mock('$lib/term', () => {
    const stubTerm = {
        year: '2024',
        quarter: 'Fall' as const,
        shortName: '2024 Fall' as const,
        longName: '2024 Fall Quarter',
        instructionStart: new Date(0),
        instructionEnd: new Date(0),
        finalsStart: new Date(0),
        finalsEnd: new Date(0),
        socAvailable: new Date(0),
        isSummerTerm: false,
    };
    return {
        getDefaultTerm: () => stubTerm,
        getTermByShortName: (shortName: string) => (shortName === stubTerm.shortName ? stubTerm : undefined),
        termData: [stubTerm],
    };
});

vi.mock('$lib/websoc', () => ({ WebSOC: { getCourseInfo: vi.fn() } }));

vi.mock('$stores/scheduleHelpers', () => ({
    getColorForNewSection: () => '#ffffff',
    colorPickerPresetColors: [],
}));

vi.mock('$providers/AppPostHogProvider', () => ({ postHog: undefined }));

import { autoSaveSchedule, saveSchedule } from '$actions/AppStoreActions';
import { setLocalStorageAutoSave } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';

interface PendingSave {
    userData: ScheduleSaveState;
    resolve: (value: { scheduleIdMap: Record<string, string> }) => void;
    reject: (error: Error) => void;
}

let pendingSaves: PendingSave[] = [];

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Just past the note autosave debounce. */
const waitForNoteDebounce = () => new Promise((resolve) => setTimeout(resolve, 1100));

type ShortCourses = ScheduleSaveState['schedules'][number]['courses'];

function scheduleState(scheduleName: string, { id, courses = [] }: { id?: string; courses?: ShortCourses } = {}) {
    return {
        schedules: [{ id, scheduleName, courses, customEvents: [], scheduleNote: '' }],
        scheduleIndex: 0,
    } satisfies ScheduleSaveState;
}

function currentSchedule() {
    return AppStore.schedule.getScheduleAsSaveState().schedules[0];
}

function editNote(note: string) {
    AppStore.updateScheduleNote(note, AppStore.getCurrentScheduleIndex());
}

function signInWithAutoSave() {
    useSessionStore.setState({ sessionIsValid: true, userId: 'user-1' });
    setLocalStorageAutoSave('true');
}

beforeEach(async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await AppStore.loadSchedule(scheduleState('Original'));

    pendingSaves = [];
    mutate.mockReset();
    mutate.mockImplementation(
        ({ userData }: { userData: ScheduleSaveState }) =>
            new Promise((resolve, reject) => pendingSaves.push({ userData, resolve, reject }))
    );
    getCourseInfo.mockReset();
});

afterEach(async () => {
    // Saves share one queue across tests, so settle anything a test left in flight.
    for (let i = 0; i < pendingSaves.length; i++) {
        pendingSaves[i].resolve({ scheduleIdMap: {} });
        await flush();
    }
    AppStore.debouncedNoteAutoSave.clear();
    useSessionStore.setState({ sessionIsValid: false, userId: null });
    useScheduleComponentsToggleStore.setState({ openAutoSaveWarning: false });
    window.localStorage.clear();
    vi.restoreAllMocks();
});

describe('schedule saves', () => {
    test('run one at a time, each sending the schedule as it is when its turn comes', async () => {
        const first = autoSaveSchedule({});
        await flush();
        editNote('typed while the first save was in flight');
        const second = saveSchedule({});
        await flush();

        expect(mutate).toHaveBeenCalledTimes(1);

        pendingSaves[0].resolve({ scheduleIdMap: {} });
        await first;
        await flush();

        expect(mutate).toHaveBeenCalledTimes(2);
        expect(pendingSaves[1].userData.schedules[0].scheduleNote).toBe('typed while the first save was in flight');

        pendingSaves[1].resolve({ scheduleIdMap: {} });
        await second;
    });

    test('saves requested while one is already waiting are combined into one request', async () => {
        const inFlight = autoSaveSchedule({});
        await flush();
        const waiting = [autoSaveSchedule({}), saveSchedule({}), autoSaveSchedule({})];
        await flush();

        pendingSaves[0].resolve({ scheduleIdMap: {} });
        await inFlight;
        await flush();

        expect(mutate).toHaveBeenCalledTimes(2);
        pendingSaves[1].resolve({ scheduleIdMap: {} });
        await Promise.all(waiting);
        expect(mutate).toHaveBeenCalledTimes(2);
    });

    test('a failed save does not block the next one', async () => {
        const first = autoSaveSchedule({});
        await flush();
        const second = autoSaveSchedule({});
        await flush();

        pendingSaves[0].reject(new Error('network down'));
        expect(await first).toBe(false);
        await flush();

        expect(mutate).toHaveBeenCalledTimes(2);
        pendingSaves[1].resolve({ scheduleIdMap: {} });
        expect(await second).toBe(true);
    });

    test('keep the unsaved-changes flag when an edit happens after the save started', async () => {
        editNote('before');
        const staleSave = autoSaveSchedule({});
        await flush();
        editNote('after');
        pendingSaves[0].resolve({ scheduleIdMap: {} });
        await staleSave;

        expect(AppStore.unsavedChanges).toBe(true);

        const currentSave = autoSaveSchedule({});
        await flush();
        pendingSaves[1].resolve({ scheduleIdMap: {} });
        await currentSave;

        expect(AppStore.unsavedChanges).toBe(false);
    });

    test('report the note as saved only if it was not edited after the save started', async () => {
        const reports: boolean[] = [];
        const onSaved = (noteIsCurrent: boolean) => reports.push(noteIsCurrent);
        AppStore.on('scheduleSaved', onSaved);

        const staleSave = autoSaveSchedule({});
        await flush();
        editNote('edited mid-save');
        pendingSaves[0].resolve({ scheduleIdMap: {} });
        await staleSave;

        const currentSave = autoSaveSchedule({});
        await flush();
        pendingSaves[1].resolve({ scheduleIdMap: {} });
        await currentSave;

        AppStore.off('scheduleSaved', onSaved);
        expect(reports).toEqual([false, true]);
    });
});

describe('schedule saves around a load', () => {
    test('a save that finishes after a successful load keeps its new ids but does not mark the load saved', async () => {
        const onSaved = vi.fn();
        AppStore.on('scheduleSaved', onSaved);
        const sentId = currentSchedule().id!;

        const save = autoSaveSchedule({});
        await flush();
        // An import keeps the ids of the schedules already present.
        await AppStore.loadSchedule(scheduleState('Imported into', { id: sentId }));
        pendingSaves[0].resolve({ scheduleIdMap: { [sentId]: 'db-id' } });
        await save;

        expect(currentSchedule().id).toBe('db-id');
        expect(onSaved).not.toHaveBeenCalled();
        AppStore.off('scheduleSaved', onSaved);
    });

    test('a header save waiting in line sends the loaded schedule, not the one from before the load', async () => {
        const inFlight = autoSaveSchedule({});
        await flush();
        const queuedHeaderSave = saveSchedule({});
        await flush();

        await AppStore.loadSchedule(scheduleState('Loaded'));
        pendingSaves[0].resolve({ scheduleIdMap: {} });
        await inFlight;
        await flush();

        expect(mutate).toHaveBeenCalledTimes(2);
        expect(pendingSaves[1].userData.schedules[0].scheduleName).toBe('Loaded');

        pendingSaves[1].resolve({ scheduleIdMap: {} });
        await queuedHeaderSave;
    });

    test('a save still completes when a load fails', async () => {
        editNote('unsaved edit');
        getCourseInfo.mockRejectedValue(new Error('WebSOC down'));
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const save = autoSaveSchedule({});
        await flush();
        const loaded = await AppStore.loadSchedule(
            scheduleState('Never loads', {
                courses: [
                    { color: '#000000', term: '2024 Fall', sectionCode: '12345', visibility: VisibilityState.Visible },
                ],
            })
        );
        expect(loaded).toBe(false);

        pendingSaves[0].resolve({ scheduleIdMap: {} });

        expect(await save).toBe(true);
        expect(AppStore.unsavedChanges).toBe(false);
        expect(currentSchedule().scheduleNote).toBe('unsaved edit');
    });
});

describe('note autosave', () => {
    test('saves about a second after typing stops when signed in with Auto Save on', async () => {
        signInWithAutoSave();
        const onEnd = vi.fn();
        AppStore.on('noteAutoSaveEnd', onEnd);

        editNote('hello');
        await flush();
        expect(mutate).not.toHaveBeenCalled();

        await waitForNoteDebounce();
        expect(mutate).toHaveBeenCalledTimes(1);
        expect(pendingSaves[0].userData.schedules[0].scheduleNote).toBe('hello');

        pendingSaves[0].resolve({ scheduleIdMap: {} });
        await flush();

        expect(onEnd).toHaveBeenCalledWith(true);
        AppStore.off('noteAutoSaveEnd', onEnd);
    });

    test('does not save or show the Auto Save warning when signed out', async () => {
        setLocalStorageAutoSave('true');

        editNote('hello');
        await waitForNoteDebounce();

        expect(mutate).not.toHaveBeenCalled();
        expect(useScheduleComponentsToggleStore.getState().openAutoSaveWarning).toBe(false);
    });

    test("a failed save doesn't report for a note that was edited again while it was saving", async () => {
        signInWithAutoSave();
        const onEnd = vi.fn();
        AppStore.on('noteAutoSaveEnd', onEnd);

        editNote('first');
        await waitForNoteDebounce();
        editNote('second');
        pendingSaves[0].reject(new Error('network down'));
        await flush();

        expect(onEnd).not.toHaveBeenCalled();

        await waitForNoteDebounce();
        pendingSaves[1].resolve({ scheduleIdMap: {} });
        await flush();

        expect(onEnd).toHaveBeenCalledTimes(1);
        expect(onEnd).toHaveBeenCalledWith(true);
        AppStore.off('noteAutoSaveEnd', onEnd);
    });
});
