export interface FilterOptions {
  levels: string[];
  geCategories: string[];
  departments: string[];
}

interface StringifiedFilterOptions {
  stringifiedLevels?: string;
  stringifiedGeCategories?: string;
  stringifiedDepartments?: string;
}

export const levels: Record<string, string> = {
  LowerDiv: 'Lower Division',
  UpperDiv: 'Upper Division',
  Graduate: 'Graduate',
};

export function stringifySearchFilters(filters: FilterOptions): StringifiedFilterOptions {
  return {
    // change empty string to undefined for API call purposes
    stringifiedLevels: filters.levels.join(',') || undefined,
    stringifiedGeCategories: filters.geCategories.join(',') || undefined,
    stringifiedDepartments: filters.departments.join(',') || undefined,
  };
}
