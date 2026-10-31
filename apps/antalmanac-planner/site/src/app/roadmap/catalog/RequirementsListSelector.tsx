import { FC } from 'react';

import './RequirementsListSelector.scss';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { RequirementsTabName, setSelectedTab } from '../../../store/slices/courseRequirementsSlice';
import TabSelector from './../sidebar/TabSelector';

const RequirementsListSelector: FC = () => {
    const dispatch = useAppDispatch();
    const selectedTab = useAppSelector((state) => state.courseRequirements.selectedTab);

    const tabs = [
        { value: 'Major', label: 'Major' },
        { value: 'Minor', label: 'Minor' },
        { value: 'GE', label: 'GE' },
        { value: 'Library', label: 'Library' },
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
