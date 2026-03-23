'use client';
import { FC, useEffect, useState } from 'react';
import './RoadmapPage.scss';
import Planner from './planner/Planner';
import MobileCourseCatalog from './catalog/MobileCourseCatalog';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import AddCoursePopup from './planner/AddCoursePopup';
import { useIsMobile } from '../../helpers/util';
import CoursePreview from '../../component/ResultPreview/CoursePreview';
import DesktopRoadmapSidebar from './sidebar/DesktopRoadmapSidebar';
import { MobileCreditsMenu } from './transfers/MobileCreditsMenu';
import { setShowToast } from '../../store/slices/roadmapSlice';
import Toast from '../../helpers/toast';
import ProfessorPreview from '../../component/ResultPreview/ProfessorPreview';
import MobileSearchMenu from '../../component/MobileSearchMenu/MobileSearchMenu';
import MobilePopup from './MobilePopup';
import { Fade, useTheme } from '@mui/material';
import { clearPreviews, removePreview } from '../../store/slices/previewSlice';
import { useCurrentPreview } from '../../hooks/preview';

const RoadmapPage: FC = () => {
  const isMobile = useIsMobile();

  const previews = useAppSelector((state) => state.preview.previewStack);

  const dispatch = useAppDispatch();

  const toastMsg = useAppSelector((state) => state.roadmap.toastMsg);
  const toastSeverity = useAppSelector((state) => state.roadmap.toastSeverity);
  const showToast = useAppSelector((state) => state.roadmap.showToast);
  const showFullscreenSearch = useAppSelector((state) => state.roadmap.showMobileFullscreenSearch);

  const [showPreview, setShowPreview] = useState(false);
  const theme = useTheme();
  const transitionTime = theme.transitions.duration.shortest;

  const handleCloseToast = () => {
    dispatch(setShowToast(false));
  };

  const fullscreenActive = isMobile && showFullscreenSearch;

  const handleClosePreview = () => {
    setShowPreview(false);
    setTimeout(() => {
      dispatch(clearPreviews());
    }, transitionTime);
  };

  const handleBackPreview = () => {
    dispatch(removePreview());
  };

  useEffect(() => {
    if (previews.length > 0) setShowPreview(true);
  }, [previews]);

  const currentPreview = useCurrentPreview();
  const resultPreview = (
    <div>
      {currentPreview &&
        (currentPreview.type === 'course' ? (
          <CoursePreview courseId={currentPreview.id} onClose={handleClosePreview} onBack={handleBackPreview} />
        ) : (
          <ProfessorPreview netid={currentPreview.id} onClose={handleClosePreview} onBack={handleBackPreview} />
        ))}
    </div>
  );

  return (
    <div className="roadmap-page">
      {!isMobile && <DesktopRoadmapSidebar />}

      {/* Mobile Popup Menus */}
      <Toast text={toastMsg} severity={toastSeverity} showToast={showToast} onClose={handleCloseToast} />
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
