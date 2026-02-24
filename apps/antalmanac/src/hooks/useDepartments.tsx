import { useDepartmentsStore } from "$stores/DepartmentsStore";
import { useEffect } from "react";

export function useDepartments() {
    const { departments, loadDepartments } = useDepartmentsStore();

    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    return {
        departments,
    };
}
