import './ResultPageContent.scss';
import { FC, ReactNode } from 'react';
import Twemoji from 'react-twemoji';

interface ResultPageSectionProps {
  title: string;
  children: ReactNode;
}

export const ResultPageSection: FC<ResultPageSectionProps> = ({ title, children }) => {
  return (
    <div className="result-page-section">
      <h2>{title}</h2>
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
      <Twemoji options={{ className: 'twemoji' }}>
        <div className="result-page-body">{children}</div>
      </Twemoji>
    </div>
  );
};

export default ResultPageContent;
