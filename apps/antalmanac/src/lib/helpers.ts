import { openSnackbar } from '$stores/SnackbarStore';
import { Theme } from '@mui/material/styles';
import { SxProps, SystemStyleObject } from '@mui/system';
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

export function mergeSx(
    ...sxProps: (SxProps<Theme> | undefined)[]
): ReadonlyArray<boolean | SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>)> {
    return sxProps.reduce((acc, sxProp) => {
        if (Array.isArray(sxProp)) {
            acc.push(...sxProp);
        } else if (sxProp != null) {
            acc.push(sxProp);
        }

        return acc;
    }, [] as any);
}

export const QUARTER_ORDER_IN_YEAR: Record<string, number> = {
    Winter: 0,
    Spring: 1,
    Summer: 2,
    Fall: 3,
};
