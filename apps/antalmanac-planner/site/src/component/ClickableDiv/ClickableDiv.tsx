import { ReactNode } from 'react';

interface ClickableDivProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

const ClickableDiv = ({ children, className, onClick }: ClickableDivProps) => {
    if (!onClick) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            className={`${className ?? ''} clickable`.trim()}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                }
            }}
            style={{ cursor: 'pointer' }}
        >
            {children}
        </div>
    );
};

export default ClickableDiv;
