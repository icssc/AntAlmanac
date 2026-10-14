import './CourseCatalog.scss';
import { useAppSelector } from '../../../store/hooks';
import SavedAndSearch from '../search/SavedAndSearch';
import GERequiredCourseList from './GERequiredCourseList';
import Library from './Library';
import MajorSelector from './MajorSelector';
import MinorSelector from './MinorSelector';
import RequirementsListSelector from './RequirementsListSelector';

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
        </div>
    );
};
