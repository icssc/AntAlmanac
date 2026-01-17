import { create } from 'zustand';

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
            const departmentsMap: Record<string, string> = {};
            for (const dept of departmentsData) {
                departmentsMap[dept.deptCode] = `${dept.deptCode}: ${dept.deptName}`;
            }
            set({ departments: departmentsMap });
        } catch (error) {
            console.error('Error loading departments: ', error);
        }
    },
}));
