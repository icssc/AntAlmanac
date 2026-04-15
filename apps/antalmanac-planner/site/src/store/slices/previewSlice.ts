import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Preview {
  type: 'course' | 'instructor';
  id: string;
}

export const previewSlice = createSlice({
  name: 'preview',
  initialState: {
    previewStack: [] as Preview[],
  },
  reducers: {
    addPreview: (state, action: PayloadAction<Preview>) => {
      state.previewStack.push(action.payload);
    },
    removePreview: (state) => {
      state.previewStack.pop();
    },
    clearPreviews: (state) => {
      state.previewStack = [];
    },
  },
});

export const { addPreview, removePreview, clearPreviews } = previewSlice.actions;

export default previewSlice.reducer;
