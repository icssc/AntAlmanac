import './CourseCatalog.scss';
import { useIsMobile } from '$planner/helpers/util';
import { useNamedAcademicTerm } from '$planner/hooks/namedAcademicTerm';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { hideMobileCatalog } from '$planner/store/slices/roadmapSlice';

import SavedAndSearch from '../search/SavedAndSearch';
import GERequiredCourseList from './GERequiredCourseList';
import Library from './Library';
import MajorSelector from './MajorSelector';
import MinorSelector from './MinorSelector';
import RequirementsListSelector from './RequirementsListSelector';

const CloseRoadmapSearchButton = () => {
    const isMobile = useIsMobile();
    const dispatch = useAppDispatch();
    const { year, quarter } = useNamedAcademicTerm();

    if (!isMobile) return <></>;

    const closeSearch = () => dispatch(hideMobileCatalog());

    return (
        <button className="fixed" onClick={closeSearch}>
            Cancel Selecting for {quarter} {year}
        </button>
    );
};

export const CourseCatalog = () => {
    const selectedCourseList = useAppSelector((state) => state.courseRequirements.selectedTab);

    return (
        <div className="course-catalog">
            <RequirementsListSelector />

            {selectedCourseList === 'Major' && <MajorSelector />}
            {selectedCourseList === 'Minor' && <MinorSelector />}
            {selectedCourseList === 'GE' && <GERequiredCourseList />}
            {selectedCourseList === 'Library' && <Library />}
            {selectedCourseList === 'Search' && <SavedAndSearch showSavedCoursesOnEmpty />}

            <CloseRoadmapSearchButton />
        </div>
    );
};
