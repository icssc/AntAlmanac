import { Button, Popover, useTheme } from '@mui/material';
import type { Course, Prerequisite, PrerequisiteTree } from '@packages/anteater-api/types';
import { formatPrerequisite } from '@packages/anteater-api/utils';
import { type FC, useState } from 'react';

import './PrereqTree.css';

type PrerequisiteNode = Prerequisite | PrerequisiteTree;

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

interface NodeProps {
    node: string;
    label: string;
}

const Node: FC<NodeProps> = (props) => {
    const theme = useTheme();
    return (
        <div style={{ padding: '1px 0' }} className={`${props.node}`}>
            <div
                className={'course'}
                style={{
                    backgroundColor: theme.vars.palette.background.paper,
                    color: theme.vars.palette.text.primary,
                }}
            >
                {props.label}
            </div>
        </div>
    );
};

interface TreeProps {
    prerequisite: PrerequisiteNode;
    key?: string;
    index?: number;
}

const PrereqTreeNode: FC<TreeProps> = (props) => {
    const prerequisite = props.prerequisite;
    const isValueNode = Object.prototype.hasOwnProperty.call(prerequisite, 'prereqType');

    if (isValueNode) {
        const prereq = prerequisite as Prerequisite;
        return (
            <li key={props.index} className={'prerequisite-node'}>
                <Node label={formatPrerequisite(prereq)} node={'prerequisite-node'} />
            </li>
        );
    } else {
        const renderableGroup = getRenderableTreeGroup(prerequisite as PrerequisiteTree);
        if (!renderableGroup) return null;
        const [prereqTreeType, prereqChildren] = renderableGroup;

        return (
            <div className={'prerequisite-node'}>
                <div style={{ display: 'inline-flex', flexDirection: 'row', padding: '0.5rem 0' }}>
                    <span style={{ margin: 'auto' }}>
                        <div className={'prereq-branch'}>{phraseMapping[prereqTreeType]}</div>
                    </span>
                    <div className={'prereq-clump'}>
                        <ul className="prereq-list">
                            {prereqChildren.map((child, index) => (
                                <PrereqTreeNode key={`tree-${index}`} index={index} prerequisite={child} />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
};

interface PrereqTreeProps {
    course: Course;
}

export const PrereqTree: FC<PrereqTreeProps> = ({ course }) => {
    const { id, department, courseNumber, prerequisiteTree, dependencies } = course;
    const hasPrereqs = Object.keys(prerequisiteTree).length > 0;
    const hasDependencies = dependencies.length > 0;

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    if (!id) return <></>;
    else if (!hasPrereqs && !hasDependencies)
        return (
            <div className={'missing-tree'}>
                <p>No Dependencies or Prerequisites!</p>
            </div>
        );
    return (
        <div>
            <div className={'prereq-tree'}>
                <div>
                    <Button onClick={handleClick} variant="contained" color="primary">
                        Display Prerequisite Tree
                    </Button>
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'center',
                            horizontal: 'right',
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-flex',
                                flexDirection: 'row',
                                margin: '10px',
                            }}
                        >
                            {/* Display dependencies */}
                            {hasDependencies && (
                                <>
                                    <ul style={{ padding: '0', display: 'flex' }}>
                                        <div className={'dependency-list-branch'}>
                                            {dependencies.map((dependency, index) => (
                                                <li key={`dependencyNode-${index}`} className={'dependency-node'}>
                                                    <Node label={dependency.id} node={'dependencyNode'} />
                                                </li>
                                            ))}
                                        </div>
                                    </ul>
                                    <div style={{ display: 'inline-flex', flexDirection: 'row', marginLeft: '0.5rem' }}>
                                        <span style={{ margin: 'auto 1rem' }}>
                                            <div className="dependency-needs dependency-branch">needs</div>
                                        </span>
                                    </div>
                                </>
                            )}
                            {/* Display the class id */}
                            <Node label={`${department} ${courseNumber}`} node={'course-node'} />
                            {/* Spawns the root of the prerequisite tree */}
                            {hasPrereqs && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                                    <PrereqTreeNode prerequisite={prerequisiteTree} />
                                </div>
                            )}
                        </div>
                    </Popover>
                </div>
            </div>
        </div>
    );
};
