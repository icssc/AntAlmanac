import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CourseGQLData } from '../../types/types';

export const courseCatalogSlice = createSlice({
    name: 'courseCatalog',
    initialState: {
        courses: {} as Record<string, CourseGQLData>,
    },
    reducers: {
        setCourse(state, action: PayloadAction<{ courseId: string; data: CourseGQLData }>) {
            state.courses[action.payload.courseId] = action.payload.data;
        },
        setCourses(state, action: PayloadAction<Record<string, CourseGQLData>>) {
            Object.assign(state.courses, action.payload);
        },
    },
});

export const { setCourse, setCourses } = courseCatalogSlice.actions;

export default courseCatalogSlice.reducer;
