import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { RequirementsTabName, setSelectedTab } from '../../../store/slices/courseRequirementsSlice';
import TabSelector from './../sidebar/TabSelector';
import { useIsMobile } from '../../../helpers/util';

const RequirementsListSelector: FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const selectedTab = useAppSelector((state) => state.courseRequirements.selectedTab);
  const lastTab = isMobile ? 'Search' : 'Saved';

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
    <div>
      <TabSelector tabs={tabs} selectedTab={selectedTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default RequirementsListSelector;
