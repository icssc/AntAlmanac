import { useIsMobile } from '$planner/helpers/util';

import './RequirementsListSelector.scss';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { type RequirementsTabName, setSelectedTab } from '$planner/store/slices/courseRequirementsSlice';
import { type FC } from 'react';

import TabSelector from './../sidebar/TabSelector';

const RequirementsListSelector: FC = () => {
    const dispatch = useAppDispatch();
    const isMobile = useIsMobile();
    const selectedTab = useAppSelector((state) => state.courseRequirements.selectedTab);
    const lastTab = isMobile ? 'Search' : 'Library';

    const tabs = [
        { value: 'Major', label: 'Major' },
        { value: 'Minor', label: 'Minor' },
        { value: 'GE', label: 'GE' },
        { value: lastTab, label: lastTab },
    ];

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
