import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSliceState } from '@peterportal/types';

const initialState: UserSliceState = {
  user: null,
  theme: 'system',
  isAdmin: false,
  autosaveEnabled: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAutosaveEnabled: (state, action: PayloadAction<boolean>) => {
      state.autosaveEnabled = action.payload;
    },
  },
});

export const { setAutosaveEnabled } = userSlice.actions;
export default userSlice.reducer;
