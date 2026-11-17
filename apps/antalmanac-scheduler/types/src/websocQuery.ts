import type { WebsocQueryParams } from '@packages/anteater-api/types';

import type { WebsocSearchInput } from './websoc';

/** Shared by the scheduler UI and MCP; preserve the scheduler's filter semantics. */
export function sanitizeWebsocParams(params: WebsocSearchInput): WebsocQueryParams {
    const { department, courseNumber, excludeRestrictionCodes, days, ...rest } = params;
    const sanitized = {
        ...rest,
        excludeRestrictionCodes: excludeRestrictionCodes.join(','),
        days: days.join(','),
    } as WebsocQueryParams;
    const normalizedDepartment = department?.toUpperCase();
    if (normalizedDepartment && normalizedDepartment !== 'ALL') sanitized.department = normalizedDepartment;
    if (courseNumber) sanitized.courseNumber = courseNumber.toUpperCase();
    for (const key of Object.keys(sanitized) as (keyof typeof sanitized)[]) {
        if (sanitized[key] === '' || sanitized[key] == null) delete sanitized[key];
    }
    return sanitized;
}
