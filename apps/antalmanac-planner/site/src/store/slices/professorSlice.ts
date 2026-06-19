import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfessorGQLData } from '../../types/types';

export const professorSlice = createSlice({
  name: 'professor',
  initialState: {
    professors: {} as Record<string, ProfessorGQLData>,
  },

  reducers: {
    setProfessor(state, action: PayloadAction<{ professorId: string; data: ProfessorGQLData }>) {
      state.professors[action.payload.professorId] = action.payload.data;
    },
  },
});

export const { setProfessor } = professorSlice.actions;

export default professorSlice.reducer;
