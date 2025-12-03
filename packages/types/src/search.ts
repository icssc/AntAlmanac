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
    // Normalized fields for improved search
    normDept?: string; // Normalized department code, e.g. "inf"
    normNumber?: string; // Normalized course number, e.g. "131"
    normCourseCode?: string; // Normalized course code, e.g. "inf 131"
    normTitle?: string; // Normalized course title
    normBlob?: string; // Normalized searchable text blob
};

export type SectionSearchResult = {
    type: 'SECTION';
    department: string;
    courseNumber: string;
    sectionCode: string;
    sectionNum: string;
    sectionType: string;
};

export type SearchResult = GESearchResult | DepartmentSearchResult | CourseSearchResult | SectionSearchResult;
