import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import { getSavedCourseSortedIndex, sortSavedCourses } from '../../helpers/savedCourses';
import type { CourseGQLData } from '../../types/types';
import { type RootState } from '../store';

const initialState: { savedCourses?: CourseGQLData[] } = {};

export const savedCoursesSlice = createSlice({
    name: 'savedCourses',
    initialState,
    reducers: {
        setSavedCourses(state, action: PayloadAction<CourseGQLData[]>) {
            state.savedCourses = sortSavedCourses(action.payload);
        },
        saveCourseInState: (state, action: PayloadAction<CourseGQLData>) => {
            if (!state.savedCourses) return;
            const courseIndex = getSavedCourseSortedIndex(state.savedCourses, action.payload);
            if (courseIndex === -1) state.savedCourses.push(action.payload);
            else state.savedCourses.splice(courseIndex, 0, action.payload);
        },
        unsaveCourseInState: (state, action: PayloadAction<CourseGQLData>) => {
            state.savedCourses = state.savedCourses?.filter((course) => course.id !== action.payload.id);
        },
    },
});

export const { setSavedCourses, saveCourseInState, unsaveCourseInState } = savedCoursesSlice.actions;

export const selectSavedCourses = (state: RootState) => state.savedCourses.savedCourses;

export default savedCoursesSlice.reducer;
