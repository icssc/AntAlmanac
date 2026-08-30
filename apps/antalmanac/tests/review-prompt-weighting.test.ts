import { REVIEW_COUNT_BATCH_SIZE, chunk } from '$lib/reviewPrompt';
import { reviewSelectionWeight, weightedOrder } from '$stores/ReviewPromptStore';
import { afterEach, describe, expect, test, vi } from 'vitest';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('reviewSelectionWeight', () => {
    test('is inverse-linear in the review count', () => {
        expect(reviewSelectionWeight(0)).toBe(1);
        expect(reviewSelectionWeight(1)).toBe(0.5);
        expect(reviewSelectionWeight(3)).toBe(0.25);
        expect(reviewSelectionWeight(9)).toBeCloseTo(0.1);
    });

    test('stays positive and finite for large counts', () => {
        for (const count of [0, 1, 50, 10_000]) {
            const weight = reviewSelectionWeight(count);
            expect(weight).toBeGreaterThan(0);
            expect(Number.isFinite(weight)).toBe(true);
        }
    });

    test('is monotonically decreasing', () => {
        const weights = [0, 1, 2, 5, 20].map(reviewSelectionWeight);
        for (let i = 1; i < weights.length; i++) {
            expect(weights[i]).toBeLessThan(weights[i - 1]);
        }
    });
});

describe('chunk', () => {
    test('splits into chunks of at most size', () => {
        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('returns a single chunk when input fits exactly', () => {
        const items = Array.from({ length: REVIEW_COUNT_BATCH_SIZE }, (_, i) => i);
        const chunks = chunk(items, REVIEW_COUNT_BATCH_SIZE);

        expect(chunks).toHaveLength(1);
        expect(chunks[0]).toHaveLength(REVIEW_COUNT_BATCH_SIZE);
    });

    test('splits at one past the batch size — the case that previously failed validation', () => {
        const items = Array.from({ length: REVIEW_COUNT_BATCH_SIZE + 1 }, (_, i) => i);
        const chunks = chunk(items, REVIEW_COUNT_BATCH_SIZE);

        expect(chunks).toHaveLength(2);
        expect(chunks[0]).toHaveLength(REVIEW_COUNT_BATCH_SIZE);
        expect(chunks[1]).toHaveLength(1);

        expect(chunks.every((c) => c.length <= REVIEW_COUNT_BATCH_SIZE)).toBe(true);
    });

    test('preserves all items in order across chunks', () => {
        const items = Array.from({ length: 457 }, (_, i) => i);
        const chunks = chunk(items, REVIEW_COUNT_BATCH_SIZE);

        expect(chunks).toHaveLength(3);
        expect(chunks.flat()).toEqual(items);
        expect(chunks.every((c) => c.length >= 1 && c.length <= REVIEW_COUNT_BATCH_SIZE)).toBe(true);
    });

    test('returns no chunks for empty input, so no request is made', () => {
        expect(chunk([], REVIEW_COUNT_BATCH_SIZE)).toEqual([]);
    });

    test('rejects a non-positive size rather than looping forever', () => {
        expect(() => chunk([1, 2, 3], 0)).toThrow();
        expect(() => chunk([1, 2, 3], -1)).toThrow();
    });
});

describe('weightedOrder', () => {
    test('returns a permutation of the input', () => {
        const items = ['a', 'b', 'c', 'd', 'e'];
        const ordered = weightedOrder(items, () => 1);

        expect(ordered).toHaveLength(items.length);
        expect([...ordered].sort()).toEqual([...items].sort());
    });

    test('handles empty and single-element input', () => {
        expect(weightedOrder([], () => 1)).toEqual([]);
        expect(weightedOrder(['only'], () => 1)).toEqual(['only']);
    });

    test('does not mutate the input array', () => {
        const items = ['a', 'b', 'c'];
        weightedOrder(items, (item) => (item === 'c' ? 10 : 1));

        expect(items).toEqual(['a', 'b', 'c']);
    });

    test('orders by weight for scripted random draws', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);

        const items = [
            { name: 'reviewed-a-lot', count: 99 },
            { name: 'unreviewed', count: 0 },
            { name: 'reviewed-once', count: 1 },
        ];
        const ordered = weightedOrder(items, (item) => reviewSelectionWeight(item.count));

        expect(ordered.map((item) => item.name)).toEqual(['unreviewed', 'reviewed-once', 'reviewed-a-lot']);
    });

    test('favors the under-reviewed candidate across many trials', () => {
        const TRIALS = 10_000;
        const items = [
            { name: 'unreviewed', count: 0 }, // weight 1
            { name: 'reviewed', count: 9 }, // weight 0.1
        ];

        let unreviewedFirst = 0;
        for (let i = 0; i < TRIALS; i++) {
            const ordered = weightedOrder(items, (item) => reviewSelectionWeight(item.count));
            if (ordered[0].name === 'unreviewed') {
                unreviewedFirst++;
            }
        }

        expect(unreviewedFirst / TRIALS).toBeGreaterThan(0.87);
        expect(unreviewedFirst / TRIALS).toBeLessThan(0.94);
    });

    test('still reaches heavily-reviewed candidates sometimes', () => {
        const TRIALS = 2_000;
        const items = [
            { name: 'unreviewed', count: 0 },
            { name: 'reviewed', count: 9 },
        ];

        const seenFirst = new Set<string>();
        for (let i = 0; i < TRIALS; i++) {
            seenFirst.add(weightedOrder(items, (item) => reviewSelectionWeight(item.count))[0].name);
        }

        expect(seenFirst).toEqual(new Set(['unreviewed', 'reviewed']));
    });

    test('stays random at review counts that underflow a naive u**(1/w) key', () => {
        const TRIALS = 6_000;
        const HEAVY = 5_000;
        const items = ['a', 'b', 'c'];
        const firstCounts = new Map(items.map((item) => [item, 0]));

        for (let i = 0; i < TRIALS; i++) {
            const first = weightedOrder(items, () => reviewSelectionWeight(HEAVY))[0];
            firstCounts.set(first, (firstCounts.get(first) ?? 0) + 1);
        }

        for (const item of items) {
            const share = (firstCounts.get(item) ?? 0) / TRIALS;
            expect(share).toBeGreaterThan(0.25);
            expect(share).toBeLessThan(0.42);
        }
    });

    test('still favors an unreviewed candidate over a heavily reviewed one', () => {
        const TRIALS = 2_000;
        const items = [
            { name: 'unreviewed', count: 0 },
            { name: 'heavy', count: 5_000 },
        ];

        let unreviewedFirst = 0;
        for (let i = 0; i < TRIALS; i++) {
            if (weightedOrder(items, (item) => reviewSelectionWeight(item.count))[0].name === 'unreviewed') {
                unreviewedFirst++;
            }
        }

        expect(unreviewedFirst / TRIALS).toBeGreaterThan(0.99);
    });

    test('approximates uniform selection when all weights are equal', () => {
        const TRIALS = 12_000;
        const items = ['a', 'b', 'c'];
        const firstCounts = new Map(items.map((item) => [item, 0]));

        for (let i = 0; i < TRIALS; i++) {
            const first = weightedOrder(items, () => 1)[0];
            firstCounts.set(first, (firstCounts.get(first) ?? 0) + 1);
        }

        for (const item of items) {
            expect((firstCounts.get(item) ?? 0) / TRIALS).toBeCloseTo(1 / 3, 1);
        }
    });
});
