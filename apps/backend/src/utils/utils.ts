export function sanitizeSearchParams(params: Record<string, string>) {
    if ('term' in params) {
        const termValue = params.term;
        const termParts = termValue.split(' ');
        if (termParts.length === 2) {
            const [year, quarter] = termParts;
            delete params.term;
            params.quarter = quarter;
            params.year = year;
        }
    }
    if ('department' in params) {
        if (params.department.toUpperCase() === 'ALL') {
            delete params.department;
        } else {
            params.department = params.department.toUpperCase();
        }
    }
    if ('courseNumber' in params) {
        params.courseNumber = params.courseNumber.toUpperCase();
    }
    for (const [key, value] of Object.entries(params)) {
        if (value === '') {
            delete params[key];
        }
    }

    return params;
}
