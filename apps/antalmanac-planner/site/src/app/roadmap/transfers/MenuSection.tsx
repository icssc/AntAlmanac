import './MenuSection.scss';
import { FC, ReactNode, useState } from 'react';
import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import { Collapse } from '@mui/material';
import ClickableDiv from '../../../component/ClickableDiv/ClickableDiv';

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
      <ClickableDiv className="header-tab" onClick={toggleExpand}>
        <h4>{title}</h4>
        <ExpandMore expanded={open} onClick={toggleExpand} />
      </ClickableDiv>
      <Collapse in={open} unmountOnExit>
        <div className="section-content">{children}</div>
      </Collapse>
    </div>
  );
};

export default MenuSection;
