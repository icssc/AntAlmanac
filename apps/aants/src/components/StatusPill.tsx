import { STATUS_PILL_DEFAULT, STATUS_PILL_STYLES } from '../theme';

const pillBase = {
    padding: '4px 10px',
    display: 'inline-block' as const,
    fontWeight: '600' as const,
    borderRadius: '9999px' as const,
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
    OPEN: { ...pillBase, ...STATUS_PILL_STYLES.OPEN },
    WAITLISTED: { ...pillBase, ...STATUS_PILL_STYLES.WAITLISTED },
    FULL: { ...pillBase, ...STATUS_PILL_STYLES.FULL },
};

const statusPillDefault: React.CSSProperties = { ...pillBase, ...STATUS_PILL_DEFAULT };

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
