import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const scheduleSlice = createSlice({
  name: 'departments',
  initialState: {
    departments: {} as Record<string, string>,
  },
  reducers: {
    setDepartments: (state, action: PayloadAction<Record<string, string>>) => {
      state.departments = action.payload;
    },
  },
});

export const { setDepartments } = scheduleSlice.actions;

export default scheduleSlice.reducer;
