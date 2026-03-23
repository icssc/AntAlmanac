'use client';
import { FC } from 'react';

import './AppHeader.scss';
import { LogoAndSwitcher } from '../../shared-components/LogoAndSwitcher';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import Profile from './Profile';
import SearchModule from '../SearchModule/SearchModule';

import SearchIcon from '@mui/icons-material/Search';
import ArrowLeftIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

import { useIsMobile } from '../../helpers/util';
import { setShowMobileFullscreenSearch } from '../../store/slices/roadmapSlice';
import { usePathname } from 'next/navigation';

import SaveButton from './SaveButton';

const AppHeader: FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const isShowFullscreenSearch = useAppSelector((state) => state.roadmap.showMobileFullscreenSearch);
  const isRoadmapPage = usePathname() == '/';

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
            <SearchModule index="courses" />
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
            <SaveButton />
          </>
        )}
        <Profile />
      </div>
    </header>
  );
};

export default AppHeader;
