import { type ReactNode } from 'react';

interface ClickableDivProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

const ClickableDiv = ({ children, className, onClick }: ClickableDivProps) => {
    return (
        <div
            className={`${className ?? ''} ${onClick ? 'clickable' : ''}`.trim()}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    onClick();
                }
            }}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {children}
        </div>
    );
};

export default ClickableDiv;
