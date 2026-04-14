/**
 * Tests for the schedule-ID race condition that occurred when `updateScheduleIds`
 * mapped returned DB IDs by array position rather than by CUID key.
 *
 * Scenario (the bug):
 *   1. Save fires with schedules [Fall (cuid-A), Winter (cuid-B)].
 *   2. While the request is in-flight the user inserts a new schedule at position 0.
 *      Array is now [NEW (cuid-NEW), Fall (cuid-A), Winter (cuid-B)].
 *   3. Response arrives with IDs for Fall and Winter.
 *   4. OLD code (positional): schedules[0].scheduleId = "db-Fall" → NEW gets Fall's DB id (wrong).
 *      NEW code (map-keyed): looks up each schedule by its current CUID → only Fall and Winter are updated.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks
// Must be declared before any import of the module under test so that vitest
// can hoist them above imports.
// ---------------------------------------------------------------------------

// Use a counter so each createId() call returns a unique, predictable ID.
let cuidCounter = 0;
vi.mock('@paralleldrive/cuid2', () => ({
    createId: () => `cuid-${++cuidCounter}`,
}));

// termData touches the DOM / fetch for term filtering; stub it out.
vi.mock('$lib/termData', () => ({
    getDefaultTerm: () => ({ shortName: 'Fall 2024' }),
    getDefaultFinalsStartDate: () => new Date(),
    getFinalsStartDateForTerm: () => new Date(),
    termData: [],
    defaultTerm: 0,
}));

// WebSOC is only used by fromScheduleSaveState which we don't call here.
vi.mock('$lib/websoc', () => ({ WebSOC: { getCourseInfo: vi.fn() } }));

// Color helper is used by addCourse which we don't call here.
vi.mock('$stores/scheduleHelpers', () => ({
    getColorForNewSection: () => '#ffffff',
    colorPickerPresetColors: [],
}));

// ---------------------------------------------------------------------------
// Now import the real class under test.
// ---------------------------------------------------------------------------
import { Schedules } from '$stores/Schedules';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read each schedule's current `scheduleId` via the public save-state API.
 * Returns an array of IDs in schedule order.
 */
function getScheduleIds(manager: Schedules): string[] {
    return manager.getScheduleAsSaveState().schedules.map((s) => s.id ?? '');
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
    // Reset the counter so each test gets fresh, predictable IDs starting from
    // cuid-1, cuid-2, … and tests don't depend on each other's counter state.
    cuidCounter = 0;
});

// ---------------------------------------------------------------------------
// Regression test — proves the OLD positional approach was broken
// ---------------------------------------------------------------------------

describe('race condition regression: positional ID mapping (old approach)', () => {
    test('writing DB IDs by array position corrupts IDs when a schedule is inserted mid-flight', () => {
        const manager = new Schedules();
        // Constructor creates one schedule.  Add a second so we start with [Fall, Winter].
        manager.addNewSchedule('Winter');
        manager.renameSchedule(0, 'Fall');

        // Capture the CUIDs that were in-flight at save time.
        const idsAtSaveTime = getScheduleIds(manager); // ['cuid-Fall', 'cuid-Winter']
        expect(idsAtSaveTime).toHaveLength(2);
        const [cuidFall, cuidWinter] = idsAtSaveTime;

        // Simulate: user inserts a brand-new schedule at position 0 while the
        // save request is in-flight.  addNewSchedule appends; reorderSchedule
        // moves it to the front so the array becomes [NEW, Fall, Winter].
        manager.addNewSchedule('New');
        manager.reorderSchedule(2, 0);

        const namesAfterInsert = manager.getScheduleNames();
        expect(namesAfterInsert).toEqual(['New', 'Fall', 'Winter']);

        // ---- Simulate the OLD (broken) positional update ----
        // The backend returned two IDs — one per schedule that existed at save
        // time — in positional order: ["db-Fall", "db-Winter"].
        //
        // The old implementation did:
        //   for (let i = 0; i < ids.length; i++) {
        //       this.schedules[i].scheduleId = ids[i];
        //   }
        //
        // We reproduce this faithfully by building a map keyed on whatever
        // CUIDs currently sit at positions 0 and 1 (after the insertion), which
        // is precisely what the old positional write would have overwritten.
        const idsAfterInsert = getScheduleIds(manager); // [cuid-NEW, cuid-Fall, cuid-Winter]
        const [cuidNew, cuidFallNow] = idsAfterInsert;

        // Positional write: index 0 → "db-Fall", index 1 → "db-Winter"
        const buggyPositionalMap: Record<string, string> = {
            [cuidNew]: 'db-Fall', // NEW ← "db-Fall"   (wrong!)
            [cuidFallNow]: 'db-Winter', // Fall ← "db-Winter" (wrong!)
        };

        manager.updateScheduleIds(buggyPositionalMap);

        const idsAfterBuggyUpdate = getScheduleIds(manager);
        const nameToId = Object.fromEntries(
            manager.getScheduleNames().map((name, i) => [name, idsAfterBuggyUpdate[i]])
        );

        // The NEW schedule now incorrectly holds a DB id that belongs to Fall.
        expect(nameToId['New']).toBe('db-Fall');
        // Fall now incorrectly holds a DB id that belongs to Winter.
        expect(nameToId['Fall']).toBe('db-Winter');
        // Winter was outside the positional range and keeps its original CUID.
        expect(nameToId['Winter']).toBe(cuidWinter);

        // The original Fall CUID is gone — its DB id landed in the wrong slot.
        expect(idsAfterBuggyUpdate).not.toContain(cuidFall);
    });
});

// ---------------------------------------------------------------------------
// Fix verification — proves the NEW map-based approach is correct
// ---------------------------------------------------------------------------

describe('fix verification: CUID-keyed ID mapping (new approach)', () => {
    test('IDs land in the correct schedules even when a schedule is inserted mid-flight', () => {
        const manager = new Schedules();
        manager.addNewSchedule('Winter');
        manager.renameSchedule(0, 'Fall');

        // Capture the CUIDs that were in-flight at save time.
        const idsAtSaveTime = getScheduleIds(manager);
        expect(idsAtSaveTime).toHaveLength(2);
        const [cuidFall, cuidWinter] = idsAtSaveTime;

        // Simulate mid-flight insertion at position 0.
        manager.addNewSchedule('New');
        manager.reorderSchedule(2, 0); // → [NEW, Fall, Winter]

        expect(manager.getScheduleNames()).toEqual(['New', 'Fall', 'Winter']);

        // Capture the NEW schedule's CUID so we can verify it is left alone.
        const cuidNew = getScheduleIds(manager)[0];

        // The backend response is keyed by the CUIDs that existed at save time.
        const scheduleIdMap: Record<string, string> = {
            [cuidFall]: 'db-Fall',
            [cuidWinter]: 'db-Winter',
        };

        // Call the FIXED updateScheduleIds.
        manager.updateScheduleIds(scheduleIdMap);

        const idsAfterUpdate = getScheduleIds(manager);
        const nameToId = Object.fromEntries(manager.getScheduleNames().map((name, i) => [name, idsAfterUpdate[i]]));

        // Fall and Winter both receive their correct DB IDs.
        expect(nameToId['Fall']).toBe('db-Fall');
        expect(nameToId['Winter']).toBe('db-Winter');

        // NEW schedule was not included in the save-time map, so its CUID is unchanged.
        expect(nameToId['New']).toBe(cuidNew);
    });

    test('IDs are correct when no mid-flight mutation occurs (happy path)', () => {
        const manager = new Schedules();
        manager.addNewSchedule('Winter');
        manager.renameSchedule(0, 'Fall');

        const [cuidFall, cuidWinter] = getScheduleIds(manager);

        const scheduleIdMap: Record<string, string> = {
            [cuidFall]: 'db-Fall',
            [cuidWinter]: 'db-Winter',
        };

        manager.updateScheduleIds(scheduleIdMap);

        const idsAfterUpdate = getScheduleIds(manager);
        expect(idsAfterUpdate[0]).toBe('db-Fall');
        expect(idsAfterUpdate[1]).toBe('db-Winter');
    });

    test('unknown CUIDs in the map are silently ignored and do not corrupt existing IDs', () => {
        const manager = new Schedules();
        manager.addNewSchedule('Winter');
        manager.renameSchedule(0, 'Fall');

        const [cuidFall, cuidWinter] = getScheduleIds(manager);

        const scheduleIdMap: Record<string, string> = {
            [cuidFall]: 'db-Fall',
            'stale-cuid-that-no-longer-exists': 'db-Stale',
        };

        manager.updateScheduleIds(scheduleIdMap);

        const idsAfterUpdate = getScheduleIds(manager);
        // Fall receives its DB id.
        expect(idsAfterUpdate[0]).toBe('db-Fall');
        // Winter keeps its original CUID unchanged.
        expect(idsAfterUpdate[1]).toBe(cuidWinter);
        // The stale entry does not appear anywhere.
        expect(idsAfterUpdate).not.toContain('db-Stale');
    });

    test('duplicate calls with the same map are idempotent (second call is a no-op because CUIDs are already gone)', () => {
        const manager = new Schedules();
        manager.addNewSchedule('Winter');
        manager.renameSchedule(0, 'Fall');

        const [cuidFall, cuidWinter] = getScheduleIds(manager);

        const scheduleIdMap: Record<string, string> = {
            [cuidFall]: 'db-Fall',
            [cuidWinter]: 'db-Winter',
        };

        // First call: replaces CUIDs with DB ids.
        manager.updateScheduleIds(scheduleIdMap);
        expect(getScheduleIds(manager)).toEqual(['db-Fall', 'db-Winter']);

        // Second call: the map keys are the old CUIDs which no longer appear in
        // any schedule, so nothing changes.
        manager.updateScheduleIds(scheduleIdMap);
        expect(getScheduleIds(manager)).toEqual(['db-Fall', 'db-Winter']);
    });
});
