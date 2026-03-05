export const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

export const outerContainer = {
    width: '100%',
    maxWidth: '520px',
    margin: '0 auto',
};

export const bannerLink = {
    textDecoration: 'none',
    color: '#ffffff',
};

export const banner = {
    backgroundColor: '#305db7',
    padding: '10px 20px',
    textAlign: 'center' as const,
    borderRadius: '8px 8px 0 0',
};

export const bannerLogo = {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: '8px',
};

export const contentSection = {
    backgroundColor: '#ffffff',
    padding: '40px 20px',
    marginBottom: '64px',
    borderRadius: '0 0 8px 8px',
};

export const h1 = {
    color: '#000000',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 20px',
};

export const text = {
    color: '#000000',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 20px',
};

export const boxBase = {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '16px',
    margin: '0 0 24px',
};

export const notificationBox = {
    ...boxBase,
    borderLeft: '4px solid #0066cc',
};

export const sectionLabel = {
    color: '#000000',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px',
};

export const changeTable = {
    width: '100%' as const,
    borderCollapse: 'collapse' as const,
};

export const changeRowCell = {
    padding: '4px 0',
    fontSize: '14px',
};

export const changeRowLabel = {
    ...changeRowCell,
    color: '#000000',
};

const pillBase = {
    padding: '4px 10px',
    display: 'inline-block' as const,
    fontWeight: '600' as const,
};

const statusPillShape = { borderRadius: '9999px' as const };
const changePillShape = { borderRadius: '6px' as const };

export const statusPillWaitlisted = {
    ...pillBase,
    ...statusPillShape,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
};

export const statusPillOpen = {
    ...pillBase,
    ...statusPillShape,
    backgroundColor: '#dcfce7',
    color: '#166534',
};

export const statusPillFull = {
    ...pillBase,
    ...statusPillShape,
    backgroundColor: '#fecaca',
    color: '#991b1b',
};

export const statusPillDefault = {
    ...pillBase,
    ...statusPillShape,
    backgroundColor: '#f1f5f9',
    color: '#475569',
};

export const restrictionPill = {
    ...pillBase,
    ...changePillShape,
    backgroundColor: '#f1f5f9',
    color: '#000000',
};

export const changeArrow = {
    margin: '0 6px',
};

export const hiddenMessageId = {
    display: 'none' as const,
    maxHeight: 0,
    overflow: 'hidden' as const,
    visibility: 'hidden' as const,
};

export const courseDetails = {
    color: '#000000',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
};

export const buttonContainer = {
    margin: '0 0 24px',
};

export const button = {
    backgroundColor: '#0066cc',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

export const hr = {
    borderColor: '#e6ebf1',
    margin: '24px 0',
};

export const footerText = {
    color: '#000000',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 16px',
    textAlign: 'center' as const,
};

export const link = {
    color: '#0066cc',
    textDecoration: 'underline',
};

export const signature = {
    color: '#000000',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
    textAlign: 'left' as const,
};
