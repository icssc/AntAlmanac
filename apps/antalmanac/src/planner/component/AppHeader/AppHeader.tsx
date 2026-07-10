'use client';
import ArrowLeftIcon from '@mui/icons-material/ArrowBack';

import './AppHeader.scss';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

import { useIsMobile } from '../../helpers/util';
import { LogoAndSwitcher } from '../../shared-components/LogoAndSwitcher';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setShowMobileFullscreenSearch } from '../../store/slices/roadmapSlice';
import SearchModule from '../SearchModule/SearchModule';
import ExportButton from './Export';
import Profile from './Profile';
import SaveButton from './SaveButton';

const AppHeader: FC = () => {
    const dispatch = useAppDispatch();
    const isMobile = useIsMobile();
    const isShowFullscreenSearch = useAppSelector((state) => state.roadmap.showMobileFullscreenSearch);
    const isRoadmapPage = usePathname() == '/planner';

    const showFullscreenSearch = () => {
        dispatch(setShowMobileFullscreenSearch(true));
    };
    const closeFullscreenSearch = () => {
        dispatch(setShowMobileFullscreenSearch(false));
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
                        {isMobile && (
                            <IconButton onClick={showFullscreenSearch} color="inherit">
                                <SearchIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        )}
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
