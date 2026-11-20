import { useEffect, useState } from 'react';

import { quarterCalendarYear } from '../helpers/quarterDates';
import trpc from '../trpc';

// Instruction start dates are fixed once published, so each term is only ever fetched once per page load
const instructionStarts = new Map<string, Promise<string | null>>();

function loadInstructionStart(year: string, quarter: string): Promise<string | null> {
    const key = `${year} ${quarter}`;
    let pending = instructionStarts.get(key);
    if (!pending) {
        pending = trpc.schedule.quarterCalendar
            .query({ year, quarter })
            .then((res) => res?.instructionStart ?? null)
            .catch(() => {
                // Only a published (or confirmed unpublished) calendar is cached; a failed request can be retried
                instructionStarts.delete(key);
                return null;
            });
        instructionStarts.set(key, pending);
    }
    return pending;
}

/**
 * The official first day of instruction (YYYY-MM-DD) for a quarter of the academic year starting in `startYear`.
 * Only requested while `enabled`. Undefined until loaded, null if the calendar doesn't cover the term.
 */
export function useInstructionStart(startYear: number, quarterName: string, enabled: boolean) {
    const [result, setResult] = useState<{ key: string; start: string | null } | null>(null);
    const year = String(quarterCalendarYear(startYear, quarterName));
    const key = `${year} ${quarterName}`;

    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        loadInstructionStart(year, quarterName).then((start) => {
            if (!cancelled) setResult({ key, start });
        });
        return () => {
            cancelled = true;
        };
    }, [enabled, year, quarterName, key]);

    return result?.key === key ? result.start : undefined;
}
