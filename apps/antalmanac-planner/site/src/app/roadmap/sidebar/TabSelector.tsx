import './TabSelector.scss';
import { FC, ReactNode } from 'react';
import { Button, ButtonGroup } from '@mui/material';

export interface TabOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface TabSelectorProps {
  tabs: TabOption[];
  selectedTab?: string;
  onTabChange: (tab: string) => void;
}

const TabSelector: FC<TabSelectorProps> = ({ tabs, selectedTab, onTabChange }) => {
  return (
    <ButtonGroup className="tab-selector" variant="text" color="secondary">
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab.value;
        return (
          <Button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={isSelected ? 'tab-button selected' : 'tab-button'}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            {tab.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default TabSelector;
