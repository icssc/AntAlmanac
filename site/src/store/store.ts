import { configureStore } from '@reduxjs/toolkit';
import previewReducer from './slices/previewSlice';
import courseRequirementsReducer from './slices/courseRequirementsSlice';
import savedCoursesReducer from './slices/savedCoursesSlice';
import reviewReducer from './slices/reviewSlice';
import roadmapReducer from './slices/roadmapSlice';
import searchReducer from './slices/searchSlice';
import transferCreditsReducer from './slices/transferCreditsSlice';
import userReducer from './slices/userSlice';
import scheduleReducer from './slices/scheduleSlice';
import courseCatalogReducer from './slices/courseCatalogSlice';
import departmentsReducer from './slices/departmentsSlice';
import { UserSliceState } from '@peterportal/types';
import professorSliceReducer from './slices/professorSlice';

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
