import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchIndex, SearchResultData } from '../../types/types';
import { FilterOptions } from '../../helpers/searchFilters';
import { RootState } from '../store';
import { shouldResetFilters } from '../../helpers/search';

interface SearchData {
  query: string;
  lastQuery: string;
  pageNumber: number;
  results: SearchResultData;
  count: number;
}

type SearchOperationType = 'none' | 'newQuery' | 'newFilters' | 'newPage';

export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    inProgressSearchOperation: 'none' as SearchOperationType,
    viewIndex: 'courses' as SearchIndex,
    courses: {
      query: '',
      lastQuery: '',
      pageNumber: 0,
      results: [],
      count: 0,
    } as SearchData,
    courseLevels: [] as string[],
    courseGeCategories: [] as string[],
    courseDepartments: [] as string[],
    instructors: {
      query: '',
      lastQuery: '',
      pageNumber: 0,
      results: [],
      count: 0,
    } as SearchData,
  },
  reducers: {
    // Things that will trigger a new search
    setQuery: (state, action: PayloadAction<string>) => {
      state.courses.query = state.instructors.query = action.payload;
      if (!action.payload) return;

      if (shouldResetFilters(state.courses.lastQuery, state.courses.query)) {
        state.courseDepartments = [];
        state.courseGeCategories = [];
        state.courseLevels = [];
      }

      state.inProgressSearchOperation = 'newQuery';
    },
    setCourseFilters: (state, action: PayloadAction<FilterOptions>) => {
      const { departments, geCategories, levels } = action.payload;
      state.courseDepartments = departments;
      state.courseGeCategories = geCategories;
      state.courseLevels = levels;
      state.inProgressSearchOperation = 'newFilters';
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state[state.viewIndex].pageNumber = action.payload;
      state.inProgressSearchOperation = 'newPage';
    },
    // Setting results
    setFirstPageResults: (
      state,
      action: PayloadAction<{ index: SearchIndex; results: SearchResultData; count: number }>,
    ) => {
      state.inProgressSearchOperation = 'none';
      const index = action.payload.index;
      state[index].results = action.payload.results;
      state[index].count = action.payload.count;
      state[index].pageNumber = 0;
      state[index].lastQuery = state[index].query;
    },
    setNewPageResults: (state, action: PayloadAction<{ index: SearchIndex; results: SearchResultData }>) => {
      state.inProgressSearchOperation = 'none';
      const index = action.payload.index;
      state[index].results = [
        ...state[index].results,
        ...action.payload.results,
      ] as (typeof state)[typeof index]['results'];
    },
    // Viewing
    setSearchViewIndex: (state, action: PayloadAction<SearchIndex>) => {
      state.viewIndex = action.payload;
    },
  },
});

export const selectCourseFilters = createSelector(
  (state: RootState) => state.search.courseDepartments,
  (state: RootState) => state.search.courseGeCategories,
  (state: RootState) => state.search.courseLevels,
  (departments, geCategories, levels) => ({ departments, geCategories, levels }),
);

export type SearchCourseFilters = ReturnType<typeof selectCourseFilters>;

export const { setQuery, setPageNumber, setCourseFilters, setFirstPageResults, setNewPageResults, setSearchViewIndex } =
  searchSlice.actions;

export default searchSlice.reducer;
