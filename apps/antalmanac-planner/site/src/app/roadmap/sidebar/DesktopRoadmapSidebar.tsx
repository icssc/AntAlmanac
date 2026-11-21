'use client';
import './DesktopRoadmapSidebar.scss';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SearchIcon from '@mui/icons-material/Search';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { Badge, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { CSSProperties, useEffect, useState } from 'react';

import { useHasUnreadTransfers } from '../../../hooks/transferCredits';
import { useResizableSidebar } from '../../../hooks/useResizableSidebar';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setSelectedSidebarTab } from '../../../store/slices/roadmapSlice';
import { clearUnreadTransfers } from '../../../store/slices/transferCreditsSlice';
import { CourseCatalog } from '../catalog/CourseCatalog';
import SavedAndSearch from '../search/SavedAndSearch';
import { TransferCreditsMenu } from '../transfers/TransferCreditsMenu';

const DesktopRoadmapSidebar = () => {
    const selectedIndex = useAppSelector((state) => state.roadmap.selectedSidebarTab);
    const [hasSeenCredits, setHasSeenCredits] = useState(false);
    const hasUnreadTransfers = useHasUnreadTransfers();
    const dispatch = useAppDispatch();
    const { containerRef, width, collapsed, isDragging, isAnimating, expand, containerProps, handleProps } =
        useResizableSidebar();

    useEffect(() => {
        if (selectedIndex === 0) {
            setHasSeenCredits(true);
        } else {
            if (hasSeenCredits) dispatch(clearUnreadTransfers());
            setHasSeenCredits(false);
        }
    }, [dispatch, hasSeenCredits, selectedIndex]);

    const containerClasses = [
        'roadmap-sidebar-container',
        collapsed && 'collapsed',
        isDragging && 'dragging',
        isAnimating && 'animating',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <div
                ref={containerRef}
                className={containerClasses}
                style={width === null ? undefined : ({ '--sidebar-width': `${width}px` } as CSSProperties)}
                {...containerProps}
            >
                <div className="sidebar-clip">
                    <div className="roadmap-sidebar" inert={collapsed}>
                        <Tabs
                            className="sidebar-tabs"
                            value={selectedIndex}
                            onChange={(_, newValue) => dispatch(setSelectedSidebarTab(newValue))}
                            variant="fullWidth"
                            // MUI measures the indicator in JS on a debounce, so it lags while the
                            // sidebar resizes. The tabs are equal thirds, so position it in CSS instead.
                            slotProps={{
                                indicator: {
                                    style: { left: `${(100 / 3) * selectedIndex}%`, width: `${100 / 3}%` },
                                },
                            }}
                        >
                            <Tab
                                icon={<SwapHorizOutlinedIcon />}
                                iconPosition="start"
                                label={
                                    <Badge
                                        variant="dot"
                                        color="error"
                                        invisible={!hasUnreadTransfers}
                                        className="unread-badge"
                                    >
                                        Credits
                                    </Badge>
                                }
                            />
                            <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label="Catalog" />
                            <Tab icon={<SearchIcon />} iconPosition="start" label="Search" />
                        </Tabs>

                        <div className="sidebar-content" id="sidebarScrollContainer">
                            {selectedIndex === 0 && <TransferCreditsMenu />}
                            {selectedIndex === 1 && <CourseCatalog />}
                            {selectedIndex === 2 && <SavedAndSearch autoFocusSearch />}
                        </div>
                    </div>
                </div>
                <div
                    className="sidebar-resize-handle"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize sidebar"
                    title="Drag to resize, or drag to the left edge to hide"
                    tabIndex={0}
                    {...handleProps}
                />
            </div>
            {collapsed && (
                <Tooltip title="Show sidebar" placement="right">
                    <IconButton className="sidebar-reopen-button" aria-label="Show sidebar" onClick={expand}>
                        <ChevronRightIcon />
                    </IconButton>
                </Tooltip>
            )}
        </>
    );
};

export default DesktopRoadmapSidebar;
