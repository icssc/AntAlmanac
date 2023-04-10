/* eslint-disable prefer-const */
import { FC } from 'react';
import { Grid, Popup } from 'semantic-ui-react';

import { PrerequisiteJSONNode, PrerequisiteJSON } from '../../../lib/peterportal.types';
import { CourseInfo } from './CourseInfoBar';
import { isDarkMode } from '$lib/helpers';

import './PrereqTree.css';

interface NodeProps {
    node: string;
    label: string;
    index?: number;
}

const Node: FC<NodeProps> = (props) => {
    return (
        <div style={{ padding: '1px 0' }} className={`${props.node}`} key={props.index}>
            <Popup trigger={<div className={'course'}>{props.label}</div>} basic position="top center" wide="very" />
        </div>
    );
};

interface TreeProps {
    prerequisiteNames: string[];
    prerequisiteJSON: PrerequisiteJSONNode;
    key?: string;
    index?: number;
}

const Tree: FC<TreeProps> = (props) => {
    // eslint-disable-next-line prefer-const
    let prerequisite = props.prerequisiteJSON;
    let isValueNode = typeof prerequisite === 'string';

    // if value is a string, render leaf node
    if (isValueNode) {
        return (
            <li key={props.index} className={'prerequisite-node'}>
                <Node label={prerequisite as string} node={'prerequisite-node'} />
            </li>
        );
    }
    // if value is an object, render the rest of the sub tree
    else {
        return (
            <div className={'prerequisite-node'}>
                <div style={{ display: 'inline-flex', flexDirection: 'row', padding: '0.5rem 0' }}>
                    <span style={{ margin: 'auto' }}>
                        <div className={'prereq-branch'}>
                            {Object.prototype.hasOwnProperty.call(prerequisite, 'OR') ? 'one of' : 'all of'}
                        </div>
                    </span>
                    <div className={'prereq-clump'}>
                        <ul className="prereq-list">
                            {(prerequisite as PrerequisiteJSON)[Object.keys(prerequisite)[0]].map((child, index) => (
                                <Tree
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

type PrereqProps = CourseInfo;

const PrereqTree: FC<PrereqProps> = (props) => {
    let hasPrereqs = props.prerequisite_tree !== '';
    let hasDependencies = Object.keys(props.prerequisite_for).length !== 0;

    if (props.id === undefined) return <></>;
    else if (!hasPrereqs && !hasDependencies)
        return (
            <div className={'missing-tree'}>
                <p>No Dependencies or Prerequisites!</p>
            </div>
        );
    return (
        <div>
            <Grid.Row className={'prereq'}>
                <div
                    style={{
                        display: 'inline-flex',
                        flexDirection: 'row',
                        width: 'fit-content',
                        justifyContent: 'center',
                        margin: 'auto',
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
                    <Node label={props.id} node={'course-node'} />

                    {/* Spawns the root of the prerequisite tree */}
                    {hasPrereqs && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                            <Tree
                                prerequisiteNames={props.prerequisite_list}
                                prerequisiteJSON={JSON.parse(props.prerequisite_tree)}
                            />
                        </div>
                    )}
                </div>
            </Grid.Row>
        </div>
    );
};

export default PrereqTree;
