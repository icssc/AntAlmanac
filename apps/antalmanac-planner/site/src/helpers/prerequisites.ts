import type { Prerequisite, PrerequisiteNode } from '@peterportal/types';

type AffiliationPrerequisite = Extract<Prerequisite, { prereqType: 'affiliation' }>;
type CHCPrerequisite = Omit<AffiliationPrerequisite, 'affiliation'> & {
    affiliation: Extract<AffiliationPrerequisite['affiliation'], { type: 'CHC' }>;
};
type RoadmapVerifiablePrerequisite = Extract<Prerequisite, { prereqType: 'course' | 'exam' }> | CHCPrerequisite;

export function isPrerequisiteNodeLeaf(prerequisite: PrerequisiteNode): prerequisite is Prerequisite {
    return 'prereqType' in prerequisite;
}

export function isRoadmapVerifiablePrerequisite(
    prerequisite: Prerequisite
): prerequisite is RoadmapVerifiablePrerequisite {
    // TODO: Validate standing, major, and school requirements once the roadmap stores the necessary profile data.
    // Until then, treat those requirements as satisfied intentionally to avoid false warnings.
    return (
        prerequisite.prereqType === 'course' ||
        prerequisite.prereqType === 'exam' ||
        (prerequisite.prereqType === 'affiliation' && prerequisite.affiliation.type === 'CHC')
    );
}

export function isRoadmapVerifiablePrerequisiteNode(prerequisite: PrerequisiteNode): boolean {
    if (isPrerequisiteNodeLeaf(prerequisite)) return isRoadmapVerifiablePrerequisite(prerequisite);

    if (prerequisite.NOT?.length) return false;

    const children = [prerequisite.AND, prerequisite.OR].flatMap((group) => group ?? []);
    return children.length > 0 && children.every(isRoadmapVerifiablePrerequisiteNode);
}
