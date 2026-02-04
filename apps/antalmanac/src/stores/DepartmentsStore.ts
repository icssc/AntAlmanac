import { create } from 'zustand';

import { DEPARTMENT_MAP } from '$components/RightPane/CoursePane/SearchForm/DepartmentSearchBar/constants';
import { WebSOC } from '$lib/websoc';

interface DepartmentsState {
    departments: Record<string, string> | null;
    loadDepartments: () => Promise<void>;
}

export const useDepartmentsStore = create<DepartmentsState>((set, get) => ({
    departments: null,
    loadDepartments: async () => {
        if (get().departments != null) {
            return;
        }
        try {
            const departmentsData = await WebSOC.getDepartments();
            const departmentsMap = Object.fromEntries(
                departmentsData.map((dept) => [dept.deptCode, `${dept.deptCode}: ${dept.deptName}`])
            );
            set({ departments: departmentsMap });
        } catch (error) {
            console.error('Error loading departments: ', error);
            set({ departments: DEPARTMENT_MAP }); //fallback to hardcoded departments
        }
    },
}));
