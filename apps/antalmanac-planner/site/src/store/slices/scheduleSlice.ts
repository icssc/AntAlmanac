import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: {
    currentWeek: '',
    currentQuarter: '',
  },
  reducers: {
    setCurrentWeek: (state, action: PayloadAction<string>) => {
      state.currentWeek = action.payload;
    },
    setCurrentQuarter: (state, action: PayloadAction<string>) => {
      state.currentQuarter = action.payload;
    },
  },
});

export const { setCurrentWeek, setCurrentQuarter } = scheduleSlice.actions;

export default scheduleSlice.reducer;
