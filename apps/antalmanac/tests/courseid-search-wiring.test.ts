import { RoadmapTermRelation, getRoadmapTermRelation, getSearchableRoadmapCourseIds } from '$lib/plannerHelpers';
import {
    type AATerm,
    type Roadmap,
    WebsocSearchInputKeysSchema,
    WebsocSearchInputSchema,
} from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

const fallTerm = { year: '2025', quarter: 'Fall' } as AATerm;

function makeRoadmap(courses: { courseId: string }[]): Roadmap {
    return {
        id: 1,
        name: 'Test Roadmap',
        content: [{ name: '2025-2026', startYear: 2025, quarters: [{ name: 'Fall', courses }] }],
    };
}

describe('courseId WebSOC contract', () => {
    test('WebsocSearchInputSchema accepts a courseId field', () => {
        const parsed = WebsocSearchInputSchema.parse({ year: '2025', quarter: 'Fall', courseId: 'COMPSCI161' });
        expect(parsed.courseId).toBe('COMPSCI161');
    });

    test('courseId is a valid getManyOfField fan-out key', () => {
        expect(WebsocSearchInputKeysSchema.enum.courseId).toBe('courseId');
        expect(WebsocSearchInputKeysSchema.enum.ge).toBe('ge');
    });
});

describe('roadmap -> courseIds extraction', () => {
    test('returns only searchable (non-custom) course ids for the term', () => {
        const roadmap = makeRoadmap([{ courseId: 'COMPSCI161' }, { courseId: 'CUSTOM#abc' }, { courseId: 'I&CSCI46' }]);
        expect(getSearchableRoadmapCourseIds(roadmap, fallTerm)).toEqual(['COMPSCI161', 'I&CSCI46']);
    });

    test('returns an empty list when the term is not in the roadmap', () => {
        const roadmap = makeRoadmap([{ courseId: 'COMPSCI161' }]);
        const winterTerm = { year: '2025', quarter: 'Winter' } as AATerm;
        expect(getSearchableRoadmapCourseIds(roadmap, winterTerm)).toEqual([]);
    });

    test('classifies a term with searchable courses as IncludesTerm', () => {
        const roadmap = makeRoadmap([{ courseId: 'COMPSCI161' }]);
        expect(getRoadmapTermRelation(roadmap, fallTerm)).toBe(RoadmapTermRelation.IncludesTerm);
    });

    test('classifies a custom-only term as NoCourses', () => {
        const roadmap = makeRoadmap([{ courseId: 'CUSTOM#only' }]);
        expect(getRoadmapTermRelation(roadmap, fallTerm)).toBe(RoadmapTermRelation.NoCourses);
    });
});
