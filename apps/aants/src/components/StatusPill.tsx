import type { CSSProperties } from 'react';

import { STATUS_PILL_DEFAULT, STATUS_PILL_STYLES } from '../theme';

const pillBase: CSSProperties = {
    padding: '4px 10px',
    display: 'inline-block',
    fontWeight: '600',
    borderRadius: '9999px',
};

const STATUS_STYLES: Record<string, CSSProperties> = {
    OPEN: { ...pillBase, ...STATUS_PILL_STYLES.OPEN },
    WAITLISTED: { ...pillBase, ...STATUS_PILL_STYLES.WAITLISTED },
    FULL: { ...pillBase, ...STATUS_PILL_STYLES.FULL },
};

const statusPillDefault: CSSProperties = { ...pillBase, ...STATUS_PILL_DEFAULT };

function getStatusPillStyle(status: string) {
    return STATUS_STYLES[status] ?? statusPillDefault;
}

/** Abbreviates WAITLISTED to WAITL on mobile to prevent wrapping */
function StatusPillText({ status }: { status: string }) {
    if (status === 'WAITLISTED') {
        return (
            <>
                <span className="status-desktop">{status}</span>
                <span className="status-mobile">WAITL</span>
            </>
        );
    }
    return <>{status}</>;
}

export function StatusPill({ status }: { status: string }) {
    return (
        <span style={getStatusPillStyle(status)}>
            <StatusPillText status={status} />
        </span>
    );
}
