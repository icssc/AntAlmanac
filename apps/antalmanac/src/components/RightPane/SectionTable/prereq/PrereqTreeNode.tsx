import { Prerequisite } from '@packages/antalmanac-types';

import { PrereqNode } from '$components/RightPane/SectionTable/prereq/PrereqNode';
import { PrerequisiteNode } from '$components/RightPane/SectionTable/prereq/PrereqTree';

import './PrereqTree.css';

enum phraseMapping {
    AND = 'all of',
    OR = 'one of',
    NOT = 'none of',
}

interface TreeProps {
    prerequisiteNames: string[];
    prerequisite: PrerequisiteNode;
    key?: string;
    index?: number;
}

export function PrereqTreeNode(props: TreeProps) {
    const prerequisite = props.prerequisite;
    const isValueNode = Object.prototype.hasOwnProperty.call(prerequisite, 'prereqType');

    if (isValueNode) {
        const prereq = prerequisite as Prerequisite;

        return (
            <li key={props.index} className={'prerequisite-node'}>
                <PrereqNode
                    label={
                        prereq.prereqType === 'course'
                            ? `${prereq.courseId} ${
                                  prereq.coreq ? '(coreq)' : prereq.minGrade ? `(min grade = ${prereq.minGrade})` : ''
                              }`
                            : `${prereq.examName} ${prereq.minGrade ? `(min grade = ${prereq.minGrade})` : ''}`
                    }
                    node={'prerequisite-node'}
                />
            </li>
        );
    }

    const prereqTree = prerequisite as Record<string, PrerequisiteNode[]>;

    return (
        <div className={'prerequisite-node'}>
            <div style={{ display: 'inline-flex', flexDirection: 'row', padding: '0.5rem 0' }}>
                <span style={{ margin: 'auto' }}>
                    <div className={'prereq-branch'}>
                        {
                            Object.entries(phraseMapping).filter(([subtreeType, _]) =>
                                Object.prototype.hasOwnProperty.call(prerequisite, subtreeType)
                            )[0][1]
                        }
                    </div>
                </span>
                <div className={'prereq-clump'}>
                    <ul className="prereq-list">
                        {prereqTree[Object.keys(prerequisite)[0]].map((child, index) => (
                            <PrereqTreeNode
                                key={`tree-${index}`}
                                prerequisiteNames={props.prerequisiteNames}
                                index={index}
                                prerequisite={child}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
