'use client';
import MobileSearchMenu from '$planner/component/MobileSearchMenu/MobileSearchMenu';

import './RoadmapPage.scss';
import CoursePreview from '$planner/component/ResultPreview/CoursePreview';
import ProfessorPreview from '$planner/component/ResultPreview/ProfessorPreview';
import Toast from '$planner/helpers/toast';
import { useIsMobile } from '$planner/helpers/util';
import { usePreviewDepth } from '$planner/hooks/usePreviewDepth';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { setSelectedTab } from '$planner/store/slices/courseRequirementsSlice';
import { setSelectedSidebarTab, setShowToast } from '$planner/store/slices/roadmapSlice';
import { Fade, useTheme } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FC, useEffect, useMemo, useState } from 'react';

import MobileCourseCatalog from './catalog/MobileCourseCatalog';
import MobilePopup from './MobilePopup';
import AddCoursePopup from './planner/AddCoursePopup';
import Planner from './planner/Planner';
import DesktopRoadmapSidebar from './sidebar/DesktopRoadmapSidebar';
import { MobileCreditsMenu } from './transfers/MobileCreditsMenu';

const RoadmapPage: FC = () => {
    const isMobile = useIsMobile();
    const dispatch = useAppDispatch();

    const toastMsg = useAppSelector((state) => state.roadmap.toastMsg);
    const toastSeverity = useAppSelector((state) => state.roadmap.toastSeverity);
    const showToast = useAppSelector((state) => state.roadmap.showToast);
    const toastAction = useAppSelector((state) => state.roadmap.toastAction);
    const showFullscreenSearch = useAppSelector((state) => state.roadmap.showMobileFullscreenSearch);

    const theme = useTheme();
    const transitionTime = theme.transitions.duration.shortest;
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const courseParam = searchParams.get('course');
    const instructorParam = searchParams.get('instructor');
    const currentPreview = useMemo(() => {
        return courseParam
            ? ({ type: 'course', id: courseParam } as const)
            : instructorParam
              ? ({ type: 'instructor', id: instructorParam } as const)
              : null;
    }, [courseParam, instructorParam]);
    const [showPreview, setShowPreview] = useState(false);
    useEffect(() => {
        if (currentPreview) setShowPreview(true);
        else setShowPreview(false);
    }, [currentPreview]);

    const previewDepth = usePreviewDepth();
    const handleCloseToast = () => dispatch(setShowToast(false));

    const handleToastClick = () => {
        if (toastAction === 'library') {
            dispatch(setSelectedSidebarTab(1));
            dispatch(setSelectedTab('Library'));
        }
    };

    const fullscreenActive = isMobile && showFullscreenSearch;

    const handleClosePreview = () => {
        setShowPreview(false);
        setTimeout(() => {
            router.push(pathname);
        }, transitionTime);
    };

    const handleBackPreview = () => {
        router.back();
    };

    const resultPreview = (
        <div>
            {currentPreview &&
                (currentPreview.type === 'course' ? (
                    <CoursePreview
                        courseId={currentPreview.id}
                        onClose={handleClosePreview}
                        onBack={handleBackPreview}
                        showBack={previewDepth > 1}
                    />
                ) : (
                    <ProfessorPreview
                        netid={currentPreview.id}
                        onClose={handleClosePreview}
                        onBack={handleBackPreview}
                        showBack={previewDepth > 1}
                    />
                ))}
        </div>
    );

    return (
        <div className="roadmap-page">
            {!isMobile && <DesktopRoadmapSidebar />}

            {/* Mobile Popup Menus */}
            <Toast
                text={toastMsg}
                severity={toastSeverity}
                showToast={showToast}
                onClose={handleCloseToast}
                onClick={handleToastClick}
            />
            <AddCoursePopup />
            <MobileCourseCatalog />
            <MobileCreditsMenu />

            {/* Main Planner View or Fullscreen Mobile Search */}
            <div className={`main-wrapper ${isMobile ? 'mobile' : ''}`} id="mobileScrollContainer">
                {fullscreenActive ? <MobileSearchMenu /> : <Planner />}
                {isMobile ? (
                    <MobilePopup show={showPreview} onClose={handleClosePreview}>
                        {resultPreview}
                    </MobilePopup>
                ) : (
                    <Fade in={showPreview} timeout={{ enter: 0, exit: transitionTime }}>
                        {resultPreview}
                    </Fade>
                )}
            </div>
        </div>
    );
};

export default RoadmapPage;
