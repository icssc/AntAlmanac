import type { PrerequisiteNode } from '@peterportal/types';

export function isRoadmapVerifiablePrerequisite(prerequisite: PrerequisiteNode): boolean {
    if ('prereqType' in prerequisite) {
        return prerequisite.prereqType === 'course' || prerequisite.prereqType === 'exam';
    }

    const children = [prerequisite.AND, prerequisite.OR, prerequisite.NOT].flatMap((group) => group ?? []);
    return children.length > 0 && children.every(isRoadmapVerifiablePrerequisite);
}
