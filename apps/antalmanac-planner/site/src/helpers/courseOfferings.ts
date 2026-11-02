import type { ProgramRequirement } from '@peterportal/types';

export const offeringQuarters = ['Winter', 'Spring', 'Summer', 'Fall'] as const;
export type OfferingQuarter = (typeof offeringQuarters)[number];
export interface OfferingTerm {
    year: number;
    quarter: OfferingQuarter;
}
export type OfferingStatus = 'offered' | 'not-offered' | 'unknown';

export function parseOfferingTerm(term: string): OfferingTerm | undefined {
    const match = /^(\d{4}) (Winter|Spring|Summer|Summer1|Summer2|Summer10wk|Fall)$/.exec(term);
    if (!match) return undefined;
    return {
        year: Number(match[1]),
        quarter: match[2].startsWith('Summer') ? 'Summer' : (match[2] as OfferingQuarter),
    };
}

export function previousOfferingTerm(quarter: OfferingQuarter, currentTerm: OfferingTerm): OfferingTerm {
    const isEarlier = offeringQuarters.indexOf(quarter) < offeringQuarters.indexOf(currentTerm.quarter);
    return { year: currentTerm.year - (isEarlier ? 0 : 1), quarter };
}

export function getOfferingStatus(
    terms: readonly string[] | undefined,
    quarter: OfferingQuarter,
    currentTerm: OfferingTerm | undefined
): OfferingStatus {
    if (!terms || !currentTerm) return 'unknown';
    const previousTerm = previousOfferingTerm(quarter, currentTerm);
    const offered = terms.some((term) => {
        const parsed = parseOfferingTerm(term);
        return parsed?.year === previousTerm.year && parsed.quarter === previousTerm.quarter;
    });
    return offered ? 'offered' : 'not-offered';
}

export function getCatalogOfferingStatuses(
    courseIds: readonly string[],
    courses: Readonly<Record<string, { terms: readonly string[] } | undefined>>,
    quarter: OfferingQuarter,
    currentTerm: OfferingTerm | undefined
): Record<string, OfferingStatus> {
    return Object.fromEntries(courseIds.map((id) => [id, getOfferingStatus(courses[id]?.terms, quarter, currentTerm)]));
}

export function getRequirementCourseIds(requirements: readonly ProgramRequirement[]): string[] {
    return [
        ...new Set(
            requirements.flatMap((requirement): string[] => {
                if (requirement.requirementType === 'Group') return getRequirementCourseIds(requirement.requirements);
                if ('courses' in requirement) return requirement.courses;
                return [];
            })
        ),
    ];
}
