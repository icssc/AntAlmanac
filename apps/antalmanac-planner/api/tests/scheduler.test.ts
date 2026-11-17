import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    identity: vi.fn(),
    getOwnedSchedules: vi.fn(),
    saveAiSchedule: vi.fn(),
}));
vi.mock('@packages/anteater-api/client', () => ({ createClient: () => ({ websoc: { query: mocks.query } }) }));
vi.mock('../src/db', () => ({ db: { select: () => ({ from: () => ({ where: mocks.identity }) }) } }));
vi.mock('@packages/db/src/mcpSchedules', () => ({
    getOwnedSchedules: mocks.getOwnedSchedules,
    saveAiSchedule: mocks.saveAiSchedule,
}));

import { AiScheduleChangesSchema, isAiSchedule, toAiScheduleName } from '@packages/antalmanac-types';

import { getSchedule, getSchedules, searchSections, writeAiSchedule } from '../src/controllers/mcp/scheduler';

beforeEach(() => {
    vi.clearAllMocks();
    process.env.DB_URL = 'postgres://unused';
    mocks.identity.mockResolvedValue([{ email: 'Trusted@uci.edu' }]);
    mocks.query.mockResolvedValue({ schools: [] });
});

describe('scheduler section search', () => {
    it('normalizes and forwards every scheduler filter', async () => {
        expect(
            await searchSections({
                term: '2026 Fall',
                department: 'compsci',
                courseNumber: 'h1',
                courseTitle: 'intro',
                courseId: 'COMPSCIH1',
                sectionCodes: '34000,34001',
                instructorName: 'Smith',
                ge: 'GE-2',
                days: ['M', 'W'],
                startTime: '09:00',
                endTime: '17:00',
                sectionType: 'Lec',
                units: '4',
                fullCourses: 'SkipFullWaitlist',
                excludeRestrictionCodes: ['A', 'B'],
                division: 'LowerDiv',
                cancelledCourses: 'Exclude',
                building: 'DBH',
                room: '1100',
                includeRelatedCourses: 'true',
            })
        ).toEqual({ schools: [] });
        expect(mocks.query).toHaveBeenCalledWith({
            year: '2026',
            quarter: 'Fall',
            department: 'COMPSCI',
            courseNumber: 'H1',
            courseTitle: 'intro',
            courseId: 'COMPSCIH1',
            sectionCodes: '34000,34001',
            instructorName: 'Smith',
            ge: 'GE-2',
            days: 'M,W',
            startTime: '09:00',
            endTime: '17:00',
            sectionType: 'Lec',
            units: '4',
            fullCourses: 'SkipFullWaitlist',
            excludeRestrictionCodes: 'A,B',
            division: 'LowerDiv',
            cancelledCourses: 'Exclude',
            building: 'DBH',
            room: '1100',
            includeRelatedCourses: 'true',
        });
    });
    it('removes ALL and empty filters and returns empty results', async () => {
        await expect(searchSections({ term: '2026 Fall', department: 'all', courseTitle: '' })).resolves.toEqual({
            schools: [],
        });
        expect(mocks.query).toHaveBeenCalledWith({ year: '2026', quarter: 'Fall' });
    });
    it('rejects invalid terms before querying and explains upstream failures', async () => {
        await expect(searchSections({ term: 'next quarter' })).rejects.toThrow('Invalid term');
        expect(mocks.query).not.toHaveBeenCalled();
        mocks.query.mockRejectedValue(new Error('Service unavailable'));
        await expect(searchSections({ term: '2026 Fall' })).rejects.toThrow(
            'WebSOC section search failed: Service unavailable'
        );
    });
});

describe('trusted identity and lazy scheduler storage', () => {
    it('uses only the authenticated planner email for reads and writes', async () => {
        mocks.getOwnedSchedules.mockResolvedValue([]);
        await getSchedules(6);
        expect(mocks.getOwnedSchedules).toHaveBeenCalledWith('Trusted@uci.edu');
        await writeAiSchedule(6, { notes: 'hello' }, 'persistent-id');
        expect(mocks.saveAiSchedule).toHaveBeenCalledWith('Trusted@uci.edu', { notes: 'hello' }, 'persistent-id');
    });
    it('explains missing identity and scheduler configuration', async () => {
        mocks.identity.mockResolvedValueOnce([]);
        await expect(getSchedules(999)).rejects.toThrow('no email');
        delete process.env.DB_URL;
        await expect(getSchedules(6)).rejects.toThrow('Scheduler storage is not configured');
        expect(mocks.getOwnedSchedules).not.toHaveBeenCalled();
    });
    it('reads owned contents with meeting offerings and preserves contents on upstream failure', async () => {
        const schedule = { id: 'owned', sections: [{ sectionCode: '34000', term: '2026 Fall' }] };
        mocks.getOwnedSchedules.mockResolvedValue([schedule]);
        expect(await getSchedule(6, 'owned')).toEqual({ ...schedule, offerings: [{ term: '2026 Fall', courses: [] }] });
        mocks.query.mockRejectedValue(new Error('offline'));
        expect(await getSchedule(6, 'owned')).toMatchObject({
            ...schedule,
            offerings: [{ term: '2026 Fall', error: expect.stringContaining('offline') }],
        });
    });
});

describe('shared scheduler validation', () => {
    it('uses local HH:mm custom-event times and preserves unscheduled events', () => {
        const event = {
            customEventID: 'study',
            title: 'Study',
            start: '10:00',
            end: '11:00',
            days: [false, true, false, false, false, false, false],
        };
        expect(AiScheduleChangesSchema.safeParse({ customEvents: [event] }).success).toBe(true);
        expect(AiScheduleChangesSchema.safeParse({ customEvents: [{ ...event, start: '', end: '' }] }).success).toBe(
            true
        );
        for (const changes of [{ start: '2026-11-16T10:00:00' }, { start: '25:00' }, { end: '09:00' }]) {
            expect(AiScheduleChangesSchema.safeParse({ customEvents: [{ ...event, ...changes }] }).success).toBe(false);
        }
    });
    it('implements the current-name prefix policy and coerces names', () => {
        expect(isAiSchedule('  AI personal')).toBe(true);
        expect(isAiSchedule('airplane')).toBe(true);
        expect(isAiSchedule(null)).toBe(false);
        expect(isAiSchedule('my ai schedule')).toBe(false);
        expect(toAiScheduleName()).toBe('ai-schedule');
        expect(toAiScheduleName(' Fall ')).toBe('ai-Fall');
        expect(toAiScheduleName(' AI-test ')).toBe('AI-test');
    });
    it('deduplicates sections, defaults visibility and rejects malformed references/events/notes', () => {
        const section = { sectionCode: '34000', term: '2026 Fall', color: '#abc' };
        expect(AiScheduleChangesSchema.parse({ sections: [section, section] }).sections).toEqual([
            { ...section, visibility: 'visible' },
        ]);
        for (const invalid of [
            { notes: 'x'.repeat(5001) },
            { sections: [{ ...section, term: 'tomorrow' }] },
            { sections: [{ ...section, sectionCode: '123abc' }] },
            { sections: [{ ...section, visibility: 'secret' }] },
            { customEvents: [{ title: 'bad', start: '', end: '', days: [], customEventID: 1 }] },
            { userId: 'foreign' },
        ])
            expect(AiScheduleChangesSchema.safeParse(invalid).success).toBe(false);
    });
});
