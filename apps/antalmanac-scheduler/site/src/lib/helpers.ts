import { openSnackbar } from '$stores/SnackbarStore';
import { type Theme } from '@mui/material/styles';
import { type SxProps, type SystemStyleObject } from '@mui/system';
import type { AATerm } from '@packages/antalmanac-types';
import type { MajorSchoolRestrictionCode } from '@packages/antalmanac-types';
import { type MouseEvent } from 'react';

const enrollmentRestrictionWarningMessages: Record<MajorSchoolRestrictionCode, (school: string) => string> = {
    N: (school) => `May be limited to students in the ${school}. Check Webreg.`,
    O: (school) => `May not be open to students in the ${school}. Check Webreg.`,
    L: () => 'May be limited to certain majors. Check Webreg.',
    M: () => 'May not be open to some majors. Check Webreg.',
};

export const getEnrollmentRestrictionWarningMessage = (
    restriction_code: MajorSchoolRestrictionCode,
    courseSchool: string
): string => {
    return enrollmentRestrictionWarningMessages[restriction_code](courseSchool);
};

export const getWarnMultipleTermsMessage = (terms: Set<AATerm>): string => {
    const names = [...terms].map((t) => t.shortName).sort();
    return `Course added from different term. Schedule now contains courses from ${names.join(', ')}.`;
};

export const warnCourse = (msgs: string[]) => {
    openSnackbar('warning', msgs.length > 1 ? msgs.join('\n') : msgs[0], {
        style: {
            whiteSpace: 'pre-line',
            '& .MuiAlert-message': { fontSize: '1.10rem' },
        },
        position: { vertical: 'top', horizontal: 'center' },
        durationSeconds: 4,
    });
};

export const warnMultipleTerms = (terms: Set<AATerm>) => {
    warnCourse([getWarnMultipleTermsMessage(terms)]);
};

// export const warnEnrollmentRestriction = (restriction_code: WebsocRestrictionCodeOption, courseSchool: string) => {
//     openSnackbar(
//         'warning',
//         getEnrollmentRestrictionWarningMessage(restriction_code as MajorSchoolRestrictionCode, courseSchool),
//         {
//             style: {
//                 whiteSpace: 'pre-line',
//                 '& .MuiAlert-message': { fontSize: '1.25rem' },
//             },
//             position: { vertical: 'top', horizontal: 'center' },
//             durationSeconds: 4,
//         }
//     );
// };

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
