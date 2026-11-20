import type { Prerequisite, PrerequisiteTree } from '@packages/anteater-api/types';

type PrerequisiteNode = Prerequisite | PrerequisiteTree;
export type PrerequisiteTreeOperator = 'AND' | 'OR' | 'NOT';

const prerequisiteTreeOperators: PrerequisiteTreeOperator[] = ['AND', 'OR', 'NOT'];

export function getRenderablePrerequisiteTreeGroup(
    tree: PrerequisiteTree
): [PrerequisiteTreeOperator, PrerequisiteNode[]] | undefined {
    const groups: [PrerequisiteTreeOperator, PrerequisiteNode[]][] = [];

    for (const operator of prerequisiteTreeOperators) {
        const children = tree[operator];
        if (children?.length) groups.push([operator, children]);
    }

    if (groups.length === 0) return undefined;
    if (groups.length === 1) return groups[0];

    return [
        'AND',
        groups.flatMap(([operator, children]) =>
            operator === 'AND' ? children : [{ [operator]: children } as PrerequisiteTree]
        ),
    ];
}

export function formatPrerequisite(prerequisite: Prerequisite): string {
    switch (prerequisite.prereqType) {
        case 'course': {
            const annotations = [
                prerequisite.coreq ? '(coreq)' : undefined,
                prerequisite.minGrade ? `(min grade = ${prerequisite.minGrade})` : undefined,
            ].filter(Boolean);
            return [prerequisite.courseId, ...annotations].join(' ');
        }
        case 'exam':
            return prerequisite.minGrade
                ? `${prerequisite.examName} (min score = ${prerequisite.minGrade})`
                : prerequisite.examName;
        case 'standing':
            if (prerequisite.standing.type === 'writingRequirement') return prerequisite.standing.value;
            return prerequisite.standing.value === 'NEW TRANSFERS'
                ? 'NEW TRANSFERS ONLY'
                : `${prerequisite.standing.value} STANDING`;
        case 'affiliation':
            switch (prerequisite.affiliation.type) {
                case 'major':
                    return `${prerequisite.affiliation.value} MAJORS ONLY`;
                case 'school':
                    return `SCHOOL OF ${prerequisite.affiliation.value} ONLY`;
                case 'CHC':
                    return 'CAMPUSWIDE HONORS ONLY';
            }
    }
}
