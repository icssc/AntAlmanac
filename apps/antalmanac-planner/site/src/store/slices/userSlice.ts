import { createSlice } from '@reduxjs/toolkit';
import { UserSliceState } from '@peterportal/types';

const initialState: UserSliceState = {
  user: null,
  theme: 'system',
  isAdmin: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
});

export default userSlice.reducer;
