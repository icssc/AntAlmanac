import './ResultPageContent.scss';
import { FC, ReactNode } from 'react';

interface ResultPageSectionProps {
  title: string;
  id?: string;
  children: ReactNode;
  indicator?: ReactNode;
  icon?: ReactNode;
}

export const ResultPageSection: FC<ResultPageSectionProps> = ({ title, id, icon, children, indicator }) => {
  return (
    <div className="result-page-section" id={id}>
      <div className="result-page-title">
        <h2>
          {icon}
          {title}
        </h2>
        {indicator}
      </div>
      {children}
    </div>
  );
};

interface ResultPageContentProps {
  sideInfo: ReactNode;
  children: ReactNode;
}
export const ResultPageContent: FC<ResultPageContentProps> = ({ sideInfo, children }) => {
  return (
    <div className="content-wrapper search-result-page">
      {sideInfo}
      <div className="result-page-body">{children}</div>
    </div>
  );
};

export default ResultPageContent;
