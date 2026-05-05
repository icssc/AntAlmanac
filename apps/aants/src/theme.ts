/**
 * Email theme constants — mirrors the app's light-mode palette from Theme.tsx.
 * Emails are always rendered in light mode, so dark-mode variants are omitted.
 */

/** Primary brand blue — matches BLUE in apps/antalmanac/src/globals.ts */
export const BLUE = '#305db7';

/**
 * Enrollment status text colors — matches lightTheme.enrollmentStatus in Theme.tsx.
 * Used as the semantic color anchor; pill variants below are derived from these hues.
 */
export const ENROLLMENT_STATUS_COLORS = {
    open: '#00c853',
    waitlist: '#ff9800',
    full: '#e53935',
} as const;

/**
 * Email pill styles for each enrollment status.
 * Background is a pale tint of the status hue; text is a darker shade for WCAG contrast.
 */
export const STATUS_PILL_STYLES = {
    OPEN: { backgroundColor: '#dcfce7', color: '#166534' },
    WAITLISTED: { backgroundColor: '#fff7ed', color: '#9a3412' },
    FULL: { backgroundColor: '#fee2e2', color: '#991b1b' },
} as const;

export const STATUS_PILL_DEFAULT = { backgroundColor: '#f1f5f9', color: '#475569' } as const;
