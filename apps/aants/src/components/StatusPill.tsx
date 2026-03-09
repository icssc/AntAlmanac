const pillBase = {
    padding: '4px 10px',
    display: 'inline-block' as const,
    fontWeight: '600' as const,
};

const statusPillShape = { borderRadius: '9999px' as const };

const STATUS_PILL_STYLES: Record<string, React.CSSProperties> = {
    WAITLISTED: { ...pillBase, ...statusPillShape, backgroundColor: '#dbeafe', color: '#1e40af' },
    OPEN: { ...pillBase, ...statusPillShape, backgroundColor: '#dcfce7', color: '#166534' },
    FULL: { ...pillBase, ...statusPillShape, backgroundColor: '#fecaca', color: '#991b1b' },
};

const statusPillDefault: React.CSSProperties = {
    ...pillBase,
    ...statusPillShape,
    backgroundColor: '#f1f5f9',
    color: '#475569',
};

function getStatusPillStyle(status: string) {
    return STATUS_PILL_STYLES[status] ?? statusPillDefault;
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
