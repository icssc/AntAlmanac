import { FC } from 'react';

import './RequirementsListSelector.scss';
import { useIsMobile } from '../../../helpers/util';
import { useIsReadOnly } from '../../../hooks/planner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { RequirementsTabName, setSelectedTab } from '../../../store/slices/courseRequirementsSlice';
import TabSelector from './../sidebar/TabSelector';

const RequirementsListSelector: FC = () => {
    const dispatch = useAppDispatch();
    const isMobile = useIsMobile();
    const selectedTab = useAppSelector((state) => state.courseRequirements.selectedTab);
    const readOnly = useIsReadOnly();
    const lastTab = isMobile ? 'Search' : 'Library';

    const tabs = [
        { value: 'Major', label: 'Major' },
        { value: 'Minor', label: 'Minor' },
        { value: 'GE', label: 'GE' },
    ];
    // Courses from the library and search can only be added to your own roadmap
    if (!readOnly) tabs.push({ value: lastTab, label: lastTab });

    const handleTabChange = (tab: string) => {
        dispatch(setSelectedTab(tab as RequirementsTabName));
    };

    return (
        <div className="requirements-list-selector">
            <TabSelector tabs={tabs} selectedTab={selectedTab} onTabChange={handleTabChange} />
        </div>
    );
};

export default RequirementsListSelector;
