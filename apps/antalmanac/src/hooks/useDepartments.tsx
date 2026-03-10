import { useEffect } from 'react';

import { useDepartmentsStore } from '$stores/DepartmentsStore';

export function useDepartments() {
    const { departments, loadDepartments } = useDepartmentsStore();

    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    return {
        departments,
    };
}
