'use client';
import { Fade, useTheme } from '@mui/material';

import './RoadmapPage.scss';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useState, useMemo } from 'react';

import MobileSearchMenu from '../../component/MobileSearchMenu/MobileSearchMenu';
import CoursePreview from '../../component/ResultPreview/CoursePreview';
import ProfessorPreview from '../../component/ResultPreview/ProfessorPreview';
import Toast from '../../helpers/toast';
import { useIsMobile } from '../../helpers/util';
import { useSaveRoadmap } from '../../hooks/planner';
import { usePreviewDepth } from '../../hooks/usePreviewDepth';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedTab } from '../../store/slices/courseRequirementsSlice';
import {
    hideMobileCatalog,
    setSelectedMobileTab,
    setShowMobileFullscreenSearch,
    setShowToast,
    setCurrentYearAndQuarter,
    setSelectedSidebarTab,
    showMobileCatalog,
} from '../../store/slices/roadmapSlice';
import { clearUnreadTransfers } from '../../store/slices/transferCreditsSlice';
import MobileCourseCatalog from './catalog/MobileCourseCatalog';
import MobileNavbar from './MobileNavbar';
import MobilePopup from './MobilePopup';
import AddCoursePopup from './planner/AddCoursePopup';
import Planner from './planner/Planner';
import DesktopRoadmapSidebar from './sidebar/DesktopRoadmapSidebar';
import { TransferCreditsMenu } from './transfers/TransferCreditsMenu';

const RoadmapPage: FC = () => {
    const isMobile = useIsMobile();
    const dispatch = useAppDispatch();

    const roadmapLoading = useAppSelector((state) => state.roadmap.roadmapLoading);
    const saveInProgress = useAppSelector((state) => state.roadmap.saveInProgress);
    const currentRevisionIndex = useAppSelector((state) => state.roadmap.currentRevisionIndex);
    const savedRevisionIndex = useAppSelector((state) => state.roadmap.savedRevisionIndex);
    const autosaveEnabled = useAppSelector((state) => state.user.autosaveEnabled);
    const { handler: saveRoadmap } = useSaveRoadmap();

    useEffect(() => {
        if (!autosaveEnabled || roadmapLoading || saveInProgress || currentRevisionIndex === savedRevisionIndex) return;
        const timer = setTimeout(() => saveRoadmap({ silent: true }), 1000);
        return () => clearTimeout(timer);
    }, [autosaveEnabled, currentRevisionIndex, savedRevisionIndex, roadmapLoading, saveInProgress, saveRoadmap]);

    const toastMsg = useAppSelector((state) => state.roadmap.toastMsg);
    const toastSeverity = useAppSelector((state) => state.roadmap.toastSeverity);
    const showToast = useAppSelector((state) => state.roadmap.showToast);
    const toastAction = useAppSelector((state) => state.roadmap.toastAction);
    const showFullscreenSearch = useAppSelector((state) => state.roadmap.showMobileFullscreenSearch);
    const selectedMobileIndex = useAppSelector((state) => state.roadmap.selectedMobileTab);

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

    useEffect(() => {
        if (!isMobile) dispatch(hideMobileCatalog());
    }, [isMobile, dispatch]);

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

    const handleMobileTabChange = (newValue: number) => {
        if (selectedMobileIndex === 1 && newValue !== 1) {
            dispatch(clearUnreadTransfers());
        }

        dispatch(setSelectedMobileTab(newValue));

        switch (newValue) {
            case 2:
                dispatch(showMobileCatalog({ year: 0, quarter: 0 }));
                dispatch(setShowMobileFullscreenSearch(false));
                break;
            case 3:
                dispatch(setCurrentYearAndQuarter({ year: 0, quarter: 0 }));
                dispatch(hideMobileCatalog());
                dispatch(setShowMobileFullscreenSearch(true));
                break;
            default:
                dispatch(hideMobileCatalog());
                dispatch(setShowMobileFullscreenSearch(false));
        }
    };

    return (
        <div className={`roadmap-page ${isMobile ? 'mobile' : ''}`}>
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

            {/* Main Planner View or Fullscreen Mobile Search */}
            <div className={`main-wrapper ${isMobile ? 'mobile' : ''}`} id="mobileScrollContainer">
                {fullscreenActive ? (
                    <MobileSearchMenu />
                ) : isMobile && selectedMobileIndex === 1 ? (
                    <TransferCreditsMenu />
                ) : isMobile && selectedMobileIndex === 2 ? (
                    <MobileCourseCatalog />
                ) : (
                    (!isMobile || selectedMobileIndex === 0) && <Planner />
                )}
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
            {isMobile && <MobileNavbar selectedMobileIndex={selectedMobileIndex} onTabChange={handleMobileTabChange} />}
        </div>
    );
};

export default RoadmapPage;
