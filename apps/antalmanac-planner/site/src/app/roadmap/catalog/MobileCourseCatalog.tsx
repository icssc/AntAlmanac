'use client';

import { useCallback, useEffect } from 'react';

import ScrollToTopButton from '../../../component/ScrollToTopButton/ScrollToTopButton';
import { useIsMobile } from '../../../helpers/util';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setSelectedTab } from '../../../store/slices/courseRequirementsSlice';
import { hideMobileCatalog } from '../../../store/slices/roadmapSlice';
import MobilePopup from '../MobilePopup';
import { CourseCatalog } from './CourseCatalog';

const MobileCourseCatalog = () => {
    const showSearch = useAppSelector((state) => state.roadmap.showMobileCatalog);
    const selectedCourseList = useAppSelector((state) => state.courseRequirements.selectedTab);
    const isMobile = useIsMobile();
    const dispatch = useAppDispatch();

    const closeSearch = useCallback(() => dispatch(hideMobileCatalog()), [dispatch]);

    useEffect(() => {
        if (isMobile && selectedCourseList === 'Library') {
            dispatch(setSelectedTab('Library'));
        } else if (!isMobile && selectedCourseList === 'Search') {
            dispatch(setSelectedTab('Library'));
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
