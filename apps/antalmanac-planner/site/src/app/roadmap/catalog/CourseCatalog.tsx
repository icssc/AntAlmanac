import './CourseCatalog.scss';
import { useIsMobile } from '../../../helpers/util';
import { useNamedAcademicTerm } from '../../../hooks/namedAcademicTerm';
import { useIsReadOnly } from '../../../hooks/planner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { hideMobileCatalog } from '../../../store/slices/roadmapSlice';
import SavedAndSearch from '../search/SavedAndSearch';
import GERequiredCourseList from './GERequiredCourseList';
import Library from './Library';
import MajorSelector from './MajorSelector';
import MinorSelector from './MinorSelector';
import RequirementsListSelector from './RequirementsListSelector';

const CloseRoadmapSearchButton = () => {
    const isMobile = useIsMobile();
    const readOnly = useIsReadOnly();
    const dispatch = useAppDispatch();
    const { year, quarter } = useNamedAcademicTerm();

    // A shared roadmap opens the catalog to view requirements, not to add a course to a quarter
    if (!isMobile || readOnly) return <></>;

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
