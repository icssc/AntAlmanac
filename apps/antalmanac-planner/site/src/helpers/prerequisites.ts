import type { Prerequisite, PrerequisiteNode } from '@peterportal/types';

type RoadmapVerifiablePrerequisite = Extract<Prerequisite, { prereqType: 'course' | 'exam' }>;

export function isRoadmapVerifiablePrerequisite(
    prerequisite: Prerequisite
): prerequisite is RoadmapVerifiablePrerequisite;
export function isRoadmapVerifiablePrerequisite(prerequisite: PrerequisiteNode): boolean;
export function isRoadmapVerifiablePrerequisite(prerequisite: PrerequisiteNode): boolean {
    // TODO: Validate these requirements once the roadmap stores the necessary student-profile data.
    // Until then, treat them as satisfied intentionally to avoid false warnings.
    if ('prereqType' in prerequisite) {
        return prerequisite.prereqType === 'course' || prerequisite.prereqType === 'exam';
    }

    if (prerequisite.NOT?.length) return false;

    const children = [prerequisite.AND, prerequisite.OR].flatMap((group) => group ?? []);
    return children.length > 0 && children.every(isRoadmapVerifiablePrerequisite);
}
