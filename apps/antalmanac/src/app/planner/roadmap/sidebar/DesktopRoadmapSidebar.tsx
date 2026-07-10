'use client';
import './DesktopRoadmapSidebar.scss';
import { useHasUnreadTransfers } from '$planner/hooks/transferCredits';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { setSelectedSidebarTab } from '$planner/store/slices/roadmapSlice';
import { clearUnreadTransfers } from '$planner/store/slices/transferCreditsSlice';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SearchIcon from '@mui/icons-material/Search';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { Badge, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';

import { CourseCatalog } from '../catalog/CourseCatalog';
import SavedAndSearch from '../search/SavedAndSearch';
import { TransferCreditsMenu } from '../transfers/TransferCreditsMenu';

const DesktopRoadmapSidebar = () => {
    const selectedIndex = useAppSelector((state) => state.roadmap.selectedSidebarTab);
    const [hasSeenCredits, setHasSeenCredits] = useState(false);
    const hasUnreadTransfers = useHasUnreadTransfers();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (selectedIndex === 0) {
            setHasSeenCredits(true);
        } else {
            if (hasSeenCredits) dispatch(clearUnreadTransfers());
            setHasSeenCredits(false);
        }
    }, [dispatch, hasSeenCredits, selectedIndex]);

    return (
        <div className="roadmap-sidebar">
            <Tabs
                className="sidebar-tabs"
                value={selectedIndex}
                onChange={(_, newValue) => dispatch(setSelectedSidebarTab(newValue))}
                variant="fullWidth"
            >
                <Tab
                    icon={<SwapHorizOutlinedIcon />}
                    iconPosition="start"
                    label={
                        <Badge variant="dot" color="error" invisible={!hasUnreadTransfers} className="unread-badge">
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
    );
};

export default DesktopRoadmapSidebar;
