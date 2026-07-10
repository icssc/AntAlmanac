import { type UserSliceState } from '@packages/planner-types';
import { createSlice } from '@reduxjs/toolkit';

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
