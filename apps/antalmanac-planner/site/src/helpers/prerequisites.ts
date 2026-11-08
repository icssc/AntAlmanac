import type { Prerequisite, PrerequisiteNode } from '@peterportal/types';

type AffiliationPrerequisite = Extract<Prerequisite, { prereqType: 'affiliation' }>;
type CHCPrerequisite = Omit<AffiliationPrerequisite, 'affiliation'> & {
    affiliation: Extract<AffiliationPrerequisite['affiliation'], { type: 'CHC' }>;
};
type RoadmapVerifiablePrerequisite = Extract<Prerequisite, { prereqType: 'course' | 'exam' }> | CHCPrerequisite;

export function isRoadmapVerifiablePrerequisite(
    prerequisite: Prerequisite
): prerequisite is RoadmapVerifiablePrerequisite; // Only lead overload can provide narrowing
export function isRoadmapVerifiablePrerequisite(prerequisite: PrerequisiteNode): boolean; // Recursive calls can't narrow type
export function isRoadmapVerifiablePrerequisite(prerequisite: PrerequisiteNode): boolean {
    // TODO: Validate standing, major, and school requirements once the roadmap stores the necessary profile data.
    // Until then, treat those requirements as satisfied intentionally to avoid false warnings.
    if ('prereqType' in prerequisite) {
        return (
            prerequisite.prereqType === 'course' ||
            prerequisite.prereqType === 'exam' ||
            (prerequisite.prereqType === 'affiliation' && prerequisite.affiliation.type === 'CHC')
        );
    }

    if (prerequisite.NOT?.length) return false;

    const children = [prerequisite.AND, prerequisite.OR].flatMap((group) => group ?? []);
    return children.length > 0 && children.every(isRoadmapVerifiablePrerequisite);
}
