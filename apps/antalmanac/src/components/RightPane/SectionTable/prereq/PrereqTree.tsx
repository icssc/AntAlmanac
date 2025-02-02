import { Button, Popover } from '@mui/material';
import { Prerequisite, PrerequisiteTree } from '@packages/antalmanac-types';
import { useCallback, useState } from 'react';

import './PrereqTree.css';

import { CourseInfo } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoBar';
import { PrereqNode } from '$components/RightPane/SectionTable/prereq/PrereqNode';
import { PrereqTreeNode } from '$components/RightPane/SectionTable/prereq/PrereqTreeNode';

export type PrerequisiteNode = Prerequisite | PrerequisiteTree;

type PrereqProps = CourseInfo;

export function PrereqTree(props: PrereqProps) {
    const hasPrereqs = JSON.stringify(props.prerequisite_tree) !== '{}';
    const hasDependencies = Object.keys(props.prerequisite_for).length !== 0;

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const open = Boolean(anchorEl);

    if (props.id === undefined) {
        return null;
    }

    if (!hasPrereqs && !hasDependencies) {
        return (
            <div className={'missing-tree'}>
                <p>No Dependencies or Prerequisites!</p>
            </div>
        );
    }

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
                            {hasDependencies && (
                                <>
                                    <ul style={{ padding: '0', display: 'flex' }}>
                                        <div className={'dependency-list-branch'}>
                                            {Object.values(props.prerequisite_for).map((dependency, index) => (
                                                <li key={`dependencyNode-${index}`} className={'dependency-node'}>
                                                    <PrereqNode label={dependency} node={'dependencyNode'} />
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
                            <PrereqNode label={`${props.department} ${props.courseNumber}`} node={'course-node'} />

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
}
