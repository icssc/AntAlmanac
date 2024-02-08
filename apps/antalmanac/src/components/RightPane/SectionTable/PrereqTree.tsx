/* eslint-disable prefer-const */
import { Prerequisite, PrerequisiteTree } from 'peterportal-api-next-types';
import { FC, useState } from 'react';
import { Button, Popover } from '@material-ui/core';

import { CourseInfo } from './CourseInfoBar';
import { useThemeStore } from '$stores/SettingsStore';

import './PrereqTree.css';

export type PrerequisiteNode = Prerequisite | PrerequisiteTree;

const phraseMapping = {
    AND: 'all of',
    OR: 'one of',
    NOT: 'none of',
};

interface NodeProps {
    node: string;
    label: string;
    index?: number;
}

const Node: FC<NodeProps> = (props) => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <div style={{ padding: '1px 0' }} className={`${props.node}`} key={props.index}>
            <div
                className={'course'}
                style={{
                    backgroundColor: isDark ? '#303030' : '#e0e0e0',
                    color: isDark ? '#bfbfbf' : 'black',
                }}
            >
                {props.label}
            </div>
        </div>
    );
};

interface TreeProps {
    prerequisiteNames: string[];
    prerequisite: PrerequisiteNode;
    key?: string;
    index?: number;
}

const PrereqTreeNode: FC<TreeProps> = (props) => {
    // eslint-disable-next-line prefer-const
    const prerequisite = props.prerequisite;
    const isValueNode = Object.prototype.hasOwnProperty.call(prerequisite, 'prereqType');

    if (isValueNode) {
        const prereq = prerequisite as Prerequisite;
        return (
            <li key={props.index} className={'prerequisite-node'}>
                <Node
                    label={`${prereq.courseId ?? prereq.examName ?? ''}${
                        prereq?.minGrade ? ` (min grade = ${prereq?.minGrade})` : ''
                    }${prereq?.coreq ? ' (coreq)' : ''}`}
                    node={'prerequisite-node'}
                />
            </li>
        );
    } else {
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
};

type PrereqProps = CourseInfo;

const PrereqTree: FC<PrereqProps> = (props) => {
    let hasPrereqs = JSON.stringify(props.prerequisite_tree) !== '{}';
    let hasDependencies = Object.keys(props.prerequisite_for).length !== 0;

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    if (props.id === undefined) return <></>;
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
                                            {Object.values(props.prerequisite_for).map((dependency, index) => (
                                                <li key={`dependencyNode-${index}`} className={'dependency-node'}>
                                                    <Node label={dependency} node={'dependencyNode'} />
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
                            <Node label={`${props.department} ${props.courseNumber}`} node={'course-node'} />
                            {/* Spawns the root of the prerequisite tree */}
                            {hasPrereqs && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                                    <PrereqTreeNode
                                        prerequisiteNames={props.prerequisite_list}
                                        prerequisite={props.prerequisite_tree}
                                    />
                                </div>
                            )}
                        </div>
                    </Popover>
                </div>
            </div>
        </div>
    );
};

export default PrereqTree;
