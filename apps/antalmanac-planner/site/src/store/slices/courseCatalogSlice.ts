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
  },
});

export const { setCourse } = courseCatalogSlice.actions;

export default courseCatalogSlice.reducer;
