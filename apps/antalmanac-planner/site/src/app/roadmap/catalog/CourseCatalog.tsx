import './CourseCatalog.scss';
import { useIsMobile } from '../../../helpers/util';
import { useAppSelector } from '../../../store/hooks';
import DestinationSelector from './DestinationSelector';
import GERequiredCourseList from './GERequiredCourseList';
import Library from './Library';
import MajorSelector from './MajorSelector';
import MinorSelector from './MinorSelector';
import RequirementsListSelector from './RequirementsListSelector';

export const CourseCatalog = () => {
    const selectedCourseList = useAppSelector((state) => state.courseRequirements.selectedTab);
    const isMobile = useIsMobile();

    return (
        <div className="course-catalog">
            <RequirementsListSelector />
            {isMobile && <DestinationSelector />}
            {selectedCourseList === 'Major' && <MajorSelector />}
            {selectedCourseList === 'Minor' && <MinorSelector />}
            {selectedCourseList === 'GE' && <GERequiredCourseList />}
            {selectedCourseList === 'Library' && <Library />}
        </div>
    );
};
