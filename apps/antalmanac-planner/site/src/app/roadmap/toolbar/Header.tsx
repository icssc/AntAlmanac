'use client';
import RedoIcon from '@mui/icons-material/Redo';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import './Header.scss';
import UndoIcon from '@mui/icons-material/Undo';
import { Badge, Button, IconButton, ButtonGroup, Paper, useMediaQuery } from '@mui/material';
import { FC } from 'react';

import { pluralize, useIsMobile } from '../../../helpers/util';
import { useHasUnreadTransfers } from '../../../hooks/transferCredits';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { redoRoadmapRevision, setSelectedMobileTab, undoRoadmapRevision } from '../../../store/slices/roadmapSlice';
import AddYearPopup from '../planner/AddYearPopup';
import RoadmapMultiplan from './RoadmapMultiplan';

interface HeaderProps {
    courseCount: number;
    unitCount: number;
    missingPrerequisites: Set<string>;
}

const Header: FC<HeaderProps> = ({ courseCount, unitCount }) => {
    const isMobile = useIsMobile();
    const dispatch = useAppDispatch();
    const currentRevisionIndex = useAppSelector((state) => state.roadmap.currentRevisionIndex);
    const revisions = useAppSelector((state) => state.roadmap.revisions);

    const handleUndo = () => {
        dispatch(undoRoadmapRevision());
    };
    const handleRedo = () => {
        dispatch(redoRoadmapRevision());
    };

    const openTransfers = () => {
        dispatch(setSelectedMobileTab(1));
    };

    const shrinkButtons = useMediaQuery('(max-width: 900px)');
    const buttonSize = shrinkButtons ? 'xsmall' : 'small';

    const hasUnreadTransfers = useHasUnreadTransfers();

    return (
        <Paper className="roadmap-header" variant="outlined">
            <div className="planner-left">
                <RoadmapMultiplan />
                <span id="planner-stats">
                    <span id="course-count">{courseCount}</span> course{pluralize(courseCount)},{' '}
                    <span id="unit-count">{unitCount}</span> unit{pluralize(unitCount)}
                </span>
            </div>
            <div className="planner-actions">
                <ButtonGroup>
                    <IconButton size="small" onClick={handleUndo} disabled={currentRevisionIndex <= 0}>
                        <UndoIcon />
                    </IconButton>

                    <IconButton
                        size="small"
                        onClick={handleRedo}
                        disabled={currentRevisionIndex >= revisions.length - 1}
                    >
                        <RedoIcon />
                    </IconButton>
                </ButtonGroup>
                <ButtonGroup>
                    <AddYearPopup buttonSize={buttonSize} />
                    {isMobile && (
                        <Badge color="error" variant="dot" invisible={!hasUnreadTransfers}>
                            <Button
                                variant="contained"
                                color="inherit"
                                size={buttonSize}
                                className="header-btn"
                                startIcon={<SwapHorizOutlinedIcon />}
                                onClick={openTransfers}
                            >
                                Add Credits
                            </Button>
                        </Badge>
                    )}
                </ButtonGroup>
            </div>
        </Paper>
    );
};

export default Header;
