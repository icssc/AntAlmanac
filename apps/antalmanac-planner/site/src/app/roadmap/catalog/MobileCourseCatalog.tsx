'use client';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { hideMobileCatalog } from '../../../store/slices/roadmapSlice';
import { CourseCatalog } from './CourseCatalog';
import MobilePopup from '../MobilePopup';
import { useCallback, useEffect } from 'react';
import { setSelectedTab } from '../../../store/slices/courseRequirementsSlice';
import { useIsMobile } from '../../../helpers/util';
import ScrollToTopButton from '../../../component/ScrollToTopButton/ScrollToTopButton';

const MobileCourseCatalog = () => {
  const showSearch = useAppSelector((state) => state.roadmap.showMobileCatalog);
  const selectedCourseList = useAppSelector((state) => state.courseRequirements.selectedTab);
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  const closeSearch = useCallback(() => dispatch(hideMobileCatalog()), [dispatch]);

  useEffect(() => {
    if (isMobile && selectedCourseList === 'Saved') {
      dispatch(setSelectedTab('Search'));
    } else if (!isMobile && selectedCourseList === 'Search') {
      dispatch(setSelectedTab('Saved'));
    }
  }, [isMobile, selectedCourseList, dispatch]);

  useEffect(() => {
    if (!isMobile) closeSearch();
  }, [isMobile, closeSearch]);

  return (
    <MobilePopup show={showSearch} onClose={closeSearch} id="sidebarScrollContainer">
      <CourseCatalog />
      <ScrollToTopButton scrollableTarget="sidebarScrollContainer" raiseButton={true} />
    </MobilePopup>
  );
};

export default MobileCourseCatalog;
