'use client';

import ScrollToTopButton from '../../../component/ScrollToTopButton/ScrollToTopButton';
import { CourseCatalog } from './CourseCatalog';

const MobileCourseCatalog = () => {
    return (
        <>
            <CourseCatalog />
            <ScrollToTopButton scrollableTarget="mobileScrollContainer" raiseButton={true} />
        </>
    );
};

export default MobileCourseCatalog;
