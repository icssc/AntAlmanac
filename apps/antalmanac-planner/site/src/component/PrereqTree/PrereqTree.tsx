'use client';
import './PrereqTree.scss';
import { FC } from 'react';
import type { Prerequisite, PrerequisiteTree, PrerequisiteNode } from '@peterportal/types';

import { CourseGQLData, CourseLookup } from '../../types/types';
import { Box, Tooltip } from '@mui/material';
import Link from 'next/link';
import { createTooltipOffset } from '../../helpers/slotProps';

type PrerequisiteTreeNodeType = 'course' | 'prerequisite' | 'dependent';

interface NodeProps {
  nodeType: PrerequisiteTreeNodeType;
  label: string;
  content: string;
  index?: number;
}

const phraseMapping = {
  AND: 'all of',
  OR: 'one of',
  NOT: 'none of',
};
const Node: FC<NodeProps> = (props) => {
  const tooltipText = props.content || props.label;
  const wrapperClassName = `${props.nodeType}-node`;

  return (
    <div className={wrapperClassName} key={props.index}>
      <Tooltip title={tooltipText} placement="top" disableInteractive slotProps={createTooltipOffset(0, -8)}>
        <Box>
          {!props.label.startsWith('AP ') ? (
            <Link
              target="_blank"
              href={'/course/' + encodeURIComponent(props.label.split('(')[0].replace(/\s+/g, ''))}
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
    return (
      <li key={props.index} className="prerequisite-node">
        <Node
          label={
            prereq.prereqType === 'course'
              ? `${prereq.courseId} ${prereq.coreq ? '(coreq)' : prereq.minGrade ? `(min grade = ${prereq.minGrade})` : ''}`
              : `${prereq.examName} ${prereq.minGrade ? `(min grade = ${prereq.minGrade})` : ''}`
          }
          content={
            props.prerequisiteNames[
              prereq.prereqType === 'course' ? prereq.courseId.replace(/ /g, '') : (prereq.examName ?? '')
            ]?.title ?? ''
          }
          nodeType="prerequisite"
        />
      </li>
    );
  }
  // if value is an object, render the rest of the sub tree
  else {
    const prereqTree = prerequisite as PrerequisiteTree;
    const prereqTreeType = Object.keys(prereqTree)[0] as keyof PrerequisiteTree;
    const prereqChildren = prereqTree[prereqTreeType] as PrerequisiteTree[];

    if (prereqTree.AND && prereqChildren.length === 1 && prereqChildren[0].OR) {
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
          <Node label={`${props.department} ${props.courseNumber}`} content={props.title} nodeType="course" />

          {/* Spawns the root of the prerequisite tree */}
          {hasPrereqs && (
            <div style={{ display: 'flex' }}>
              <PrereqTreeNode prerequisiteNames={props.prerequisites} prerequisiteJSON={props.prerequisiteTree} />
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
