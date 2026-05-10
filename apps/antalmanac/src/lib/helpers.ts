import { openSnackbar } from '$stores/SnackbarStore';
import { MouseEvent } from 'react';

export const warnMultipleTerms = (terms: Set<string>) => {
    openSnackbar(
        'warning',
        `Course added from different term.\nSchedule now contains courses from ${[...terms].sort().join(', ')}.`,
        { style: { whiteSpace: 'pre-line' } }
    );
};

export async function clickToCopy(event: MouseEvent<HTMLElement>, sectionCode: string) {
    event.stopPropagation();
    await navigator.clipboard.writeText(sectionCode);
    openSnackbar('success', 'WebsocSection code copied to clipboard');
}

export const FAKE_LOCATIONS = ['VRTL REMOTE', 'ON LINE', 'TBA'];

export const QUARTER_ORDER_IN_YEAR: Record<string, number> = {
    Winter: 0,
    Spring: 1,
    Summer: 2,
    Fall: 3,
};
