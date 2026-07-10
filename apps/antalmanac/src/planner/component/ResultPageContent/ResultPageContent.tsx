import './ResultPageContent.scss';
import { type FC, type ReactNode } from 'react';
import Twemoji from 'react-twemoji';

interface ResultPageSectionProps {
    title: string;
    id?: string;
    children: ReactNode;
    indicator?: ReactNode;
}

export const ResultPageSection: FC<ResultPageSectionProps> = ({ title, id, children, indicator }) => {
    return (
        <div className="result-page-section" id={id}>
            <div className="result-page-title">
                <h2>{title}</h2>
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
            <Twemoji options={{ className: 'twemoji' }}>
                <div className="result-page-body">{children}</div>
            </Twemoji>
        </div>
    );
};

export default ResultPageContent;
