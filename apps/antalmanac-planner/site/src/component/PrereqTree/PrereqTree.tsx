'use client';
import './PrereqTree.scss';
import { Box, Tooltip } from '@mui/material';
import { formatPrerequisite } from '@packages/anteater-api/utils';
import type { Prerequisite, PrerequisiteTree, PrerequisiteNode } from '@peterportal/types';
import Link from 'next/link';
import { FC } from 'react';

import { createTooltipOffset } from '../../helpers/slotProps';
import { CourseGQLData, CourseLookup } from '../../types/types';

type PrerequisiteTreeNodeType = 'course' | 'prerequisite' | 'dependent';

interface NodeProps {
    nodeType: PrerequisiteTreeNodeType;
    label: string;
    content: string;
    courseId?: string;
    index?: number;
}

const phraseMapping = {
    AND: 'all of',
    OR: 'one of',
    NOT: 'none of',
};
type PrerequisiteTreeOperator = keyof typeof phraseMapping;

const getRenderableTreeGroup = (tree: PrerequisiteTree): [PrerequisiteTreeOperator, PrerequisiteNode[]] | undefined => {
    const groups = (Object.keys(phraseMapping) as PrerequisiteTreeOperator[]).flatMap((operator) => {
        const children = tree[operator];
        return children?.length ? ([[operator, children]] as [PrerequisiteTreeOperator, PrerequisiteNode[]][]) : [];
    });

    if (groups.length === 0) return undefined;
    if (groups.length === 1) return groups[0];

    return [
        'AND',
        groups.flatMap(([operator, children]) =>
            operator === 'AND' ? children : [{ [operator]: children } as PrerequisiteTree]
        ),
    ];
};

const Node: FC<NodeProps> = (props) => {
    const tooltipText = props.content || props.label;
    const wrapperClassName = `${props.nodeType}-node`;

    return (
        <div className={wrapperClassName} key={props.index}>
            <Tooltip title={tooltipText} placement="top" disableInteractive slotProps={createTooltipOffset(0, -8)}>
                <Box>
                    {props.courseId ? (
                        <Link
                            target="_blank"
                            href={'/planner/course/' + encodeURIComponent(props.courseId.replace(/\s+/g, ''))}
                            role="button"
                            className="node"
                        >
                            {props.label}
                        </Link>
                    ) : (
                        <div className="node">{`${props.label}`}</div>
                    )}
                </Box>
            </Tooltip>
        </div>
    );
};

interface TreeProps {
    prerequisiteNames: CourseLookup;
    prerequisiteJSON: PrerequisiteNode;
    key?: string;
    index?: number;
}

const PrereqTreeNode: FC<TreeProps> = (props) => {
    const prerequisite = props.prerequisiteJSON;
    const isValueNode = Object.prototype.hasOwnProperty.call(prerequisite, 'prereqType');

    // if value is a string, render leaf node
    if (isValueNode) {
        const prereq = prerequisite as Prerequisite;
        const courseId = prereq.prereqType === 'course' ? prereq.courseId : undefined;
        return (
            <li key={props.index} className="prerequisite-node">
                <Node
                    label={formatPrerequisite(prereq)}
                    content={courseId ? (props.prerequisiteNames[courseId.replace(/ /g, '')]?.title ?? '') : ''}
                    courseId={courseId}
                    nodeType="prerequisite"
                />
            </li>
        );
    }
    // if value is an object, render the rest of the sub tree
    else {
        const prereqTree = prerequisite as PrerequisiteTree;
        const renderableGroup = getRenderableTreeGroup(prereqTree);
        if (!renderableGroup) return null;
        const [prereqTreeType, prereqChildren] = renderableGroup;

        if (
            prereqTreeType === 'AND' &&
            prereqChildren.length === 1 &&
            'OR' in prereqChildren[0] &&
            prereqChildren[0].OR
        ) {
            return <PrereqTreeNode prerequisiteNames={props.prerequisiteNames} prerequisiteJSON={prereqChildren[0]} />;
        }

        return (
            <div style={{ margin: 'auto 0' }} className="prerequisite-node">
                <div style={{ display: 'inline-flex', flexDirection: 'row', padding: '0.5rem 0' }}>
                    <span style={{ margin: 'auto' }}>
                        <div className="prereq-branch">{phraseMapping[prereqTreeType]}</div>
                    </span>
                    <div className="prereq-clump">
                        <ul className="prereq-list">
                            {prereqChildren.map((child, index) => (
                                <PrereqTreeNode
                                    key={`tree-${index}`}
                                    prerequisiteNames={props.prerequisiteNames}
                                    index={index}
                                    prerequisiteJSON={child}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
};

interface PrereqProps extends CourseGQLData {}

const PrereqTree: FC<PrereqProps> = (props) => {
    const hasPrereqs = JSON.stringify(props.prerequisiteTree) !== '{}';
    const hasDependents = Object.keys(props.dependents).length !== 0;

    if (props.id === undefined) return <></>;
    else if (!hasPrereqs && !hasDependents)
        return (
            <div className="prereq-text-box">
                <p>No Prerequisites or Dependents!</p>
            </div>
        );
    return (
        <div>
            <div className="prereq">
                <div
                    style={{
                        display: 'inline-flex',
                        flexDirection: 'row',
                        width: 'fit-content',
                        justifyContent: 'center',
                        margin: 'auto',
                    }}
                >
                    {/* Display dependents */}
                    {hasDependents && (
                        <>
                            <ul style={{ padding: '0', display: 'flex' }}>
                                <div className="dependent-list-branch">
                                    {Object.values(props.dependents).map((dependent, index) => (
                                        <li key={`dependent-node-${index}`} className="dependent-node">
                                            <Node
                                                label={`${dependent.department} ${dependent.courseNumber}`}
                                                content={dependent.title}
                                                courseId={`${dependent.department}${dependent.courseNumber}`}
                                                nodeType="dependent"
                                            />
                                        </li>
                                    ))}
                                </div>
                            </ul>

                            <div style={{ display: 'inline-flex', flexDirection: 'row', marginLeft: '0.5rem' }}>
                                <span style={{ margin: 'auto 1rem' }}>
                                    <div className="dependent-needs dependent-branch">needs</div>
                                </span>
                            </div>
                        </>
                    )}

                    {/* Display the class id */}
                    <Node
                        label={`${props.department} ${props.courseNumber}`}
                        content={props.title}
                        courseId={`${props.department}${props.courseNumber}`}
                        nodeType="course"
                    />

                    {/* Spawns the root of the prerequisite tree */}
                    {hasPrereqs && (
                        <div style={{ display: 'flex' }}>
                            <PrereqTreeNode
                                prerequisiteNames={props.prerequisites}
                                prerequisiteJSON={props.prerequisiteTree}
                            />
                        </div>
                    )}
                </div>
                {props.prerequisiteText !== '' && (
                    <div
                        className="prereq-text-box"
                        style={{
                            padding: '1em',
                            marginTop: '2em',
                        }}
                    >
                        <p>
                            <b>Prerequisite: </b>
                            {props.prerequisiteText}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrereqTree;
