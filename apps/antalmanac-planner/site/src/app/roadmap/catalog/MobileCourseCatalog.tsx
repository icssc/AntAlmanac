'use client';

import { useCallback, useEffect } from 'react';

import ScrollToTopButton from '../../../component/ScrollToTopButton/ScrollToTopButton';
import { useIsMobile } from '../../../helpers/util';
import { useAppDispatch } from '../../../store/hooks';
import { hideMobileCatalog } from '../../../store/slices/roadmapSlice';
import { CourseCatalog } from './CourseCatalog';

const MobileCourseCatalog = () => {
    const isMobile = useIsMobile();
    const dispatch = useAppDispatch();

    const closeSearch = useCallback(() => dispatch(hideMobileCatalog()), [dispatch]);

    useEffect(() => {
        if (!isMobile) closeSearch();
    }, [isMobile, closeSearch]);

    return (
        <>
            <CourseCatalog />
            <ScrollToTopButton scrollableTarget="mobileScrollContainer" raiseButton={true} />
        </>
    );
};

export default MobileCourseCatalog;
