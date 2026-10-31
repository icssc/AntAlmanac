import { openSnackbar } from '$stores/SnackbarStore';
import { type Theme } from '@mui/material/styles';
import { type SxProps, type SystemStyleObject } from '@mui/system';
import type { AATerm } from '@packages/antalmanac-types';
import type { WebsocRestrictionCodeOption } from '@packages/antalmanac-types';
import { type MouseEvent } from 'react';

type MajorSchoolRestrictionCode = Extract<WebsocRestrictionCodeOption, 'L' | 'M' | 'N' | 'O'>;

const enrollmentRestrictionWarningMessages: Record<MajorSchoolRestrictionCode, (school: string) => string> = {
    N: (school) => `This section is limited to students in the ${school}. Check Webreg before enrolling.`,
    O: (school) => `This section is not open to students in the ${school}. Check Webreg before enrolling.`,
    L: () => 'This section may be limited to certain majors. Check Webreg before enrolling.',
    M: (school) => `This section may not be open to some majors in the ${school}. Check Webreg before enrolling.`,
};

function getEnrollmentRestrictionWarningMessage(
    restriction_code: MajorSchoolRestrictionCode,
    courseSchool: string
): string {
    return enrollmentRestrictionWarningMessages[restriction_code](courseSchool);
}

export const warnMultipleTerms = (terms: Set<AATerm>) => {
    const names = [...terms].map((t) => t.shortName).sort();
    openSnackbar(
        'warning',
        `Course added from different term.\nSchedule now contains courses from ${names.join(', ')}.`,
        { style: { whiteSpace: 'pre-line' } }
    );
};

export const warnEnrollmentRestriction = (restriction_code: WebsocRestrictionCodeOption, courseSchool: string) => {
    openSnackbar(
        'warning',
        getEnrollmentRestrictionWarningMessage(restriction_code as MajorSchoolRestrictionCode, courseSchool),
        {
            style: {
                whiteSpace: 'pre-line',
                '& .MuiAlert-message': { fontSize: '1.25rem' },
            },
            position: { vertical: 'top', horizontal: 'center' },
            durationSeconds: 8,
        }
    );
};

export async function clickToCopy(event: MouseEvent<HTMLElement>, sectionCode: string) {
    event.stopPropagation();
    await navigator.clipboard.writeText(sectionCode);
    openSnackbar('success', 'WebsocSection code copied to clipboard');
}

/**
 * Merges MUI sx props. Later styles override earlier ones.
 *
 * Taken from [MUI internals](https://github.com/mui/mui-x/blob/master/packages/x-date-pickers/src/internals/utils/utils.ts)
 */
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
