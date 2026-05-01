/** Minimal row shape used to pick the default popover graph (matches `EnrollmentHistory` fields used). */
export interface EnrollmentHistoryPopoverRow {
    year: string;
    quarter: string;
    sectionCode: string;
    instructors: string[];
}

export interface EnrollmentHistoryPopoverContext {
    /** Term short name (e.g. `2025 Fall`), same format as `termData` / schedule `term`. */
    termShortName: string;
    sectionCode: string;
    instructors: string[];
}

/**
 * Picks the history index that best matches the section the user opened the popover from
 * (same term, section code when available, overlapping instructors). Falls back to the newest entry.
 */
export function findDefaultEnrollmentHistoryIndex(
    history: EnrollmentHistoryPopoverRow[],
    context: EnrollmentHistoryPopoverContext
): number {
    if (!history.length) {
        return 0;
    }

    const termParts = context.termShortName.trim().split(/\s+/);
    const year = termParts[0];
    const quarter = termParts.slice(1).join(' ');
    const sectionNorm = context.sectionCode.trim().toUpperCase();
    const instructorSet = new Set(
        context.instructors.map((n) => n.trim()).filter((n) => n.length > 0 && n !== 'STAFF')
    );

    const termMatches = history.filter((h) => h.year === year && h.quarter === quarter);
    const pool = termMatches.length ? termMatches : history;

    const sameSection = pool.filter((h) => h.sectionCode.trim().toUpperCase() === sectionNorm);
    const sectionPool = sameSection.length ? sameSection : pool;

    const withInstructorOverlap = sectionPool.filter((h) => {
        if (instructorSet.size === 0) {
            return true;
        }
        return h.instructors.some((name) => {
            const t = name.trim();
            return t.length > 0 && t !== 'STAFF' && instructorSet.has(t);
        });
    });
    const pickFrom = withInstructorOverlap.length ? withInstructorOverlap : sectionPool;

    const newestInFullList = history.length - 1;
    let bestIndex = newestInFullList;
    let bestRank = -1;

    for (const h of pickFrom) {
        const idx = history.indexOf(h);
        if (idx < 0) {
            continue;
        }
        const sameTerm = h.year === year && h.quarter === quarter;
        const sameSec = h.sectionCode.trim().toUpperCase() === sectionNorm;
        let instructorOverlap = 0;
        if (instructorSet.size > 0) {
            for (const name of h.instructors) {
                const t = name.trim();
                if (t && t !== 'STAFF' && instructorSet.has(t)) {
                    instructorOverlap++;
                }
            }
        }
        const rank = (sameTerm ? 4 : 0) + (sameSec ? 2 : 0) + instructorOverlap;
        if (rank > bestRank || (rank === bestRank && idx > bestIndex)) {
            bestRank = rank;
            bestIndex = idx;
        }
    }

    return bestIndex;
}
