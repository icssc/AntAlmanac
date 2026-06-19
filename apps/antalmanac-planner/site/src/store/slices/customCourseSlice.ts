import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomCourse } from '../../types/types';

export const customCoursesSlice = createSlice({
  name: 'customCourses',
  initialState: {
    userCustomCourses: [] as CustomCourse[],
    customCoursesLoaded: false,
  },
  reducers: {
    setCustomCourses: (state, action: PayloadAction<CustomCourse[]>) => {
      state.userCustomCourses = action.payload;
      state.customCoursesLoaded = true;
    },
    addCustomCourse: (state, action: PayloadAction<CustomCourse>) => {
      state.userCustomCourses.push(action.payload);
    },
    removeCustomCourse: (state, action: PayloadAction<number>) => {
      state.userCustomCourses = state.userCustomCourses.filter((course) => course.id !== action.payload);
    },
    updateCustomCourse: (state, action: PayloadAction<CustomCourse>) => {
      const course = state.userCustomCourses.find((course) => course.id === action.payload.id);
      if (course) {
        course.courseName = action.payload.courseName;
        course.units = action.payload.units;
        course.description = action.payload.description;
      }
    },
  },
});

export const { setCustomCourses, addCustomCourse, removeCustomCourse, updateCustomCourse } = customCoursesSlice.actions;

export default customCoursesSlice.reducer;
