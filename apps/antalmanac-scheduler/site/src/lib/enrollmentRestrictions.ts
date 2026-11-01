import type { School, WebsocRestrictionCodeOption } from '@packages/antalmanac-types';

export type MajorSchoolRestrictionCode = Extract<WebsocRestrictionCodeOption, 'L' | 'M' | 'N' | 'O'>;

interface RestrictionCheck {
    restrictions: string;
    courseSchool?: string;
    userSchools: School[];
}

export function getRestrictionToWarn({
    restrictions,
    courseSchool,
    userSchools,
}: RestrictionCheck): MajorSchoolRestrictionCode | null {
    if (userSchools.length === 0 || !courseSchool) {
        return null;
    }

    const codes = new Set(restrictions.split(' ').filter((code) => code !== 'and' && code !== 'or'));
    const inCourseSchool = userSchools.some((school) => school === courseSchool);

    if (codes.has('N') && !inCourseSchool) return 'N';
    if (codes.has('O') && inCourseSchool) return 'O';
    if (codes.has('L') && !inCourseSchool) return 'L';
    if (codes.has('M') && inCourseSchool) return 'M';
    return null;
}
