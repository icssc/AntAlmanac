'use client';
import { pluralize, useIsMobile } from '$planner/helpers/util';
import { useHasUnreadTransfers } from '$planner/hooks/transferCredits';

import './Header.scss';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { redoRoadmapRevision, undoRoadmapRevision } from '$planner/store/slices/roadmapSlice';
import { clearUnreadTransfers, setShowMobileCreditsMenu } from '$planner/store/slices/transferCreditsSlice';
import RedoIcon from '@mui/icons-material/Redo';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import { Badge, Button, ButtonGroup, IconButton, Paper, useMediaQuery } from '@mui/material';
import { type FC } from 'react';

import AddYearPopup from '../planner/AddYearPopup';
import RoadmapMultiplan from './RoadmapMultiplan';

interface HeaderProps {
    courseCount: number;
    unitCount: number;
    missingPrerequisites: Set<string>;
}

const Header: FC<HeaderProps> = ({ courseCount, unitCount }) => {
    const showTransfers = useAppSelector((state) => state.transferCredits.showMobileCreditsMenu);
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

    const toggleTransfers = () => {
        if (showTransfers) {
            // After closing the menu, clear all the unread markers
            dispatch(clearUnreadTransfers());
        }
        dispatch(setShowMobileCreditsMenu(!showTransfers));
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
                                onClick={toggleTransfers}
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
