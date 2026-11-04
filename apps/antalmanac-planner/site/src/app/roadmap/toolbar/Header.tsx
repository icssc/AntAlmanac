'use client';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import RedoIcon from '@mui/icons-material/Redo';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import './Header.scss';
import UndoIcon from '@mui/icons-material/Undo';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Badge, Button, Chip, IconButton, ButtonGroup, Paper, useMediaQuery } from '@mui/material';
import { FC } from 'react';

import { pluralize, useIsMobile } from '../../../helpers/util';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';
import { useIsReadOnly } from '../../../hooks/planner';
import { useHasUnreadTransfers } from '../../../hooks/transferCredits';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    redoRoadmapRevision,
    selectCurrentPlan,
    showMobileCatalog,
    undoRoadmapRevision,
} from '../../../store/slices/roadmapSlice';
import { setShowMobileCreditsMenu, clearUnreadTransfers } from '../../../store/slices/transferCreditsSlice';
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
    const readOnly = useIsReadOnly();
    const planName = useAppSelector(selectCurrentPlan).name;
    const isLoggedIn = useIsLoggedIn();

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

    if (readOnly) {
        return (
            <Paper className="roadmap-header" variant="outlined">
                <div className="planner-left">
                    <h1 className="shared-plan-name">{planName}</h1>
                    <Chip icon={<VisibilityOutlinedIcon />} label="View only" size="small" variant="outlined" />
                    <span id="planner-stats">
                        <span id="course-count">{courseCount}</span> course{pluralize(courseCount)},{' '}
                        <span id="unit-count">{unitCount}</span> unit{pluralize(unitCount)}
                    </span>
                </div>
                <div className="planner-actions">
                    <ButtonGroup>
                        {isMobile && (
                            <Button
                                variant="contained"
                                color="inherit"
                                size={buttonSize}
                                className="header-btn"
                                startIcon={<FormatListBulletedIcon />}
                                onClick={() => dispatch(showMobileCatalog())}
                            >
                                Requirements
                            </Button>
                        )}
                        <Button variant="contained" size={buttonSize} href="/planner">
                            {isLoggedIn ? 'Go to my roadmap' : 'Make your own roadmap'}
                        </Button>
                    </ButtonGroup>
                </div>
            </Paper>
        );
    }

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
