import './MenuSection.scss';
import { FC, ReactNode, useState } from 'react';
import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import { Collapse } from '@mui/material';

export const SectionDescription: FC<{ children: ReactNode }> = ({ children }) => {
  return <p className="section-description">{children}</p>;
};

interface MenuSectionProps {
  title: string;
  children?: ReactNode;
}

const MenuSection: FC<MenuSectionProps> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  const toggleExpand = () => setOpen(!open);

  return (
    <div className="transfer-credits-section">
      <div
        className="header-tab"
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggleExpand();
        }}
      >
        <h4>{title}</h4>
        <ExpandMore expanded={open} onClick={toggleExpand} />
      </div>
      <Collapse in={open} unmountOnExit>
        <div className="section-content">{children}</div>
      </Collapse>
    </div>
  );
};

export default MenuSection;
