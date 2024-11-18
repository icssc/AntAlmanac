export type GESearchResult = {
    type: 'GE_CATEGORY';
    name: string;
};

export type DepartmentSearchResult = {
    type: 'DEPARTMENT';
    name: string;
    alias?: string;
};

export type CourseSearchResult = {
    type: 'COURSE';
    name: string;
    alias?: string;
    metadata: {
        department: string;
        number: string;
    };
};

export type SearchResult = GESearchResult | DepartmentSearchResult | CourseSearchResult;
