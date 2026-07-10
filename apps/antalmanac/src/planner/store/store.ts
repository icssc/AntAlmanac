import { type UserSliceState } from '@packages/planner-types';
import { configureStore } from '@reduxjs/toolkit';

import courseCatalogReducer from './slices/courseCatalogSlice';
import courseRequirementsReducer from './slices/courseRequirementsSlice';
import customCoursesReducer from './slices/customCourseSlice';
import departmentsReducer from './slices/departmentsSlice';
import previewReducer from './slices/previewSlice';
import professorSliceReducer from './slices/professorSlice';
import reviewReducer from './slices/reviewSlice';
import roadmapReducer from './slices/roadmapSlice';
import savedCoursesReducer from './slices/savedCoursesSlice';
import scheduleReducer from './slices/scheduleSlice';
import searchReducer from './slices/searchSlice';
import transferCreditsReducer from './slices/transferCreditsSlice';
import userReducer from './slices/userSlice';

const reducer = {
    preview: previewReducer,
    courseRequirements: courseRequirementsReducer,
    savedCourses: savedCoursesReducer,
    review: reviewReducer,
    roadmap: roadmapReducer,
    search: searchReducer,
    transferCredits: transferCreditsReducer,
    user: userReducer,
    schedule: scheduleReducer,
    courseCatalog: courseCatalogReducer,
    departments: departmentsReducer,
    professors: professorSliceReducer,
    customCourses: customCoursesReducer,
};

export function generateStore(user: UserSliceState) {
    return configureStore({
        reducer,
        preloadedState: { user },
    });
}
type StoreType = ReturnType<typeof generateStore>;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<StoreType['getState']>;
export type AppDispatch = StoreType['dispatch'];
