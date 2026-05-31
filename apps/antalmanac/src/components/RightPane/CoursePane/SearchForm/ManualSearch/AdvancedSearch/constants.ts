import type { WebsocRestrictionCodeOption } from '@packages/antalmanac-types';
import type { WebsocDivisionOption, WebsocFullCoursesOption } from '@packages/anteater-api/types';

export const DIVISION_OPTIONS = [
    { value: 'ANY', label: 'Any Division' },
    { value: 'LowerDiv', label: 'Lower Division' },
    { value: 'UpperDiv', label: 'Upper Division' },
    { value: 'Graduate', label: 'Graduate/Professional' },
] as const satisfies readonly { value: WebsocDivisionOption; label: string }[];

export const FULL_COURSES_OPTIONS = [
    { value: 'ANY', label: 'Include all classes' },
    { value: 'SkipFull', label: 'Skip full courses' },
    { value: 'SkipFullWaitlist', label: 'Include full courses if space on waitlist' },
    { value: 'FullOnly', label: 'Show only full or waitlisted courses' },
    { value: 'Overenrolled', label: 'Show only over-enrolled courses' },
] as const satisfies readonly { value: WebsocFullCoursesOption; label: string }[];

export const EXCLUDE_RESTRICTION_CODES_OPTIONS = [
    { value: 'A', label: 'A: Prerequisite required' },
    { value: 'B', label: 'B: Authorization code required' },
    { value: 'C', label: 'C: Fee required' },
    { value: 'D', label: 'D: Pass/Not Pass option only' },
    { value: 'E', label: 'E: Freshmen only' },
    { value: 'F', label: 'F: Sophomores only' },
    { value: 'G', label: 'G: Lower-division only' },
    { value: 'H', label: 'H: Juniors only' },
    { value: 'I', label: 'I: Seniors only' },
    { value: 'J', label: 'J: Upper-division only' },
    { value: 'K', label: 'K: Graduate only' },
    { value: 'L', label: 'L: Major only' },
    { value: 'M', label: 'M: Non-major only' },
    { value: 'N', label: 'N: School major only' },
    { value: 'O', label: 'O: Non-school major only' },
    { value: 'R', label: 'R: Biomedical Pass/Fail course (School of Medicine only)' },
    { value: 'S', label: 'S: Satisfactory/Unsatisfactory only' },
    { value: 'X', label: 'X: Separate authorization codes required to add, drop, or change enrollment' },
] as const satisfies readonly { value: WebsocRestrictionCodeOption; label: string }[];

export const DAYS_OPTIONS = [
    { value: 'Su', label: 'Su: Sunday' },
    { value: 'M', label: 'M: Monday' },
    { value: 'Tu', label: 'Tu: Tuesday' },
    { value: 'W', label: 'W: Wednesday' },
    { value: 'Th', label: 'Th: Thursday' },
    { value: 'F', label: 'F: Friday' },
    { value: 'Sa', label: 'Sa: Saturday' },
];
