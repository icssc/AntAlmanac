'use client';
import ArrowLeftIcon from '@mui/icons-material/ArrowBack';

import './AppHeader.scss';
import { IconButton } from '@mui/material';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import { useIsMobile } from '../../helpers/util';
import { LogoAndSwitcher } from '../../shared-components/LogoAndSwitcher';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedMobileTab, setShowMobileFullscreenSearch } from '../../store/slices/roadmapSlice';
import { setShowMobileCreditsMenu } from '../../store/slices/transferCreditsSlice';
import SearchModule from '../SearchModule/SearchModule';
import ExportButton from './Export';
import Profile from './Profile';
import SaveButton from './SaveButton';

const AppHeader: FC = () => {
    const dispatch = useAppDispatch();
    const isMobile = useIsMobile();
    const isShowFullscreenSearch = useAppSelector((state) => state.roadmap.showMobileFullscreenSearch);
    const isRoadmapPage = usePathname() == '/planner';

    const closeFullscreenSearch = () => {
        dispatch(setShowMobileFullscreenSearch(false));
        dispatch(setSelectedMobileTab(0));
        dispatch(setShowMobileCreditsMenu(false));
    };

    if (isMobile && isShowFullscreenSearch && isRoadmapPage)
        return (
            <header className="navbar mobile">
                <div className="navbar-nav">
                    <div className="navbar-left">
                        <IconButton onClick={closeFullscreenSearch} color="inherit">
                            <ArrowLeftIcon />
                        </IconButton>
                    </div>
                    <div className="fullscreen-search-row">
                        <SearchModule index="courses" autoFocusInput />
                    </div>
                </div>
            </header>
        );

    return (
        <header className={`navbar ${isMobile ? 'mobile' : 'desktop'}`}>
            <div className="navbar-nav">
                <div className="navbar-left">
                    <LogoAndSwitcher />
                </div>

                {/* Search */}
                {isRoadmapPage && (
                    <>
                        <ExportButton />
                        <SaveButton />
                    </>
                )}
                <Profile />
            </div>
        </header>
    );
};

export default AppHeader;
