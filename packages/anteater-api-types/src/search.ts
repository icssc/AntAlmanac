import { paths } from './generated/anteater-api-types';

export type GESearchResult = {
    type: 'GE_CATEGORY';
    name: string;
};

export type DepartmentSearchResult = {
    type: 'DEPARTMENT';
    name: string;
};

export type CourseSearchResult = {
    type: 'COURSE';
    name: string;
    metadata: {
        department: string;
        number: string;
    };
};

export type SearchResult = GESearchResult | DepartmentSearchResult | CourseSearchResult;

export type SearchResponse = paths['/v2/rest/search']['get']['responses'][200]['content']['application/json'];
