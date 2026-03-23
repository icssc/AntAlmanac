import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  APExam,
  TransferredGE,
  TransferredCourse,
  TransferredAPExam,
  TransferredUncategorized,
  SelectedApReward,
} from '@peterportal/types';

type DataLoadingState = 'waiting' | 'loading' | 'done';

export type TransferWithUnread<T> = T & { unread?: true };

export const transferCreditsSlice = createSlice({
  name: 'transferCredits',
  initialState: {
    showMobileCreditsMenu: false,
    dataLoadState: 'waiting' as DataLoadingState,
    transferredCourses: [] as TransferWithUnread<TransferredCourse>[],
    apExamInfo: [] as APExam[],
    userAPExams: [] as TransferWithUnread<TransferredAPExam>[],
    selectedApRewards: [] as SelectedApReward[],
    transferredGEs: [] as TransferredGE[],
    uncategorizedCourses: [] as TransferWithUnread<TransferredUncategorized>[],
  },
  reducers: {
    setShowMobileCreditsMenu: (state, action: PayloadAction<boolean>) => {
      state.showMobileCreditsMenu = action.payload;
    },
    setDataLoadState: (state, action: PayloadAction<DataLoadingState>) => {
      state.dataLoadState = action.payload;
    },
    addTransferredCourse: (state, action: PayloadAction<TransferredCourse>) => {
      state.transferredCourses.push(action.payload);
    },
    removeTransferredCourse: (state, action: PayloadAction<string>) => {
      state.transferredCourses = state.transferredCourses.filter((course) => course.courseName !== action.payload);
    },
    updateTransferredCourse: (state, action: PayloadAction<TransferredCourse>) => {
      const course = state.transferredCourses.find((course) => course.courseName === action.payload.courseName);
      if (course) {
        course.units = action.payload.units;
      }
    },
    setTransferredCourses: (state, action: PayloadAction<TransferWithUnread<TransferredCourse>[]>) => {
      state.transferredCourses = action.payload;
    },
    setAPExams: (state, action: PayloadAction<TransferWithUnread<APExam>[]>) => {
      state.apExamInfo = action.payload;
    },
    setUserAPExams: (state, action: PayloadAction<TransferWithUnread<TransferredAPExam>[]>) => {
      state.userAPExams = action.payload;
    },
    addUserAPExam: (state, action: PayloadAction<TransferredAPExam>) => {
      state.userAPExams.push(action.payload);
    },
    removeUserAPExam: (state, action: PayloadAction<string>) => {
      state.userAPExams = state.userAPExams.filter((exam) => exam.examName !== action.payload);
      state.selectedApRewards = state.selectedApRewards.filter((reward) => reward.examName !== action.payload);
    },
    updateUserExam: (state, action: PayloadAction<TransferredAPExam>) => {
      const e = state.userAPExams.find((exam) => exam.examName === action.payload.examName);
      if (e) {
        e.score = action.payload.score;
        e.units = action.payload.units;
      }
    },
    setSelectedApRewards: (state, action: PayloadAction<SelectedApReward[]>) => {
      state.selectedApRewards = action.payload;
    },
    addSelectedApReward: (state, action: PayloadAction<SelectedApReward>) => {
      state.selectedApRewards.push(action.payload);
    },
    updateSelectedApReward: (state, action: PayloadAction<SelectedApReward>) => {
      const e = state.selectedApRewards.find(
        (exam) => exam.examName === action.payload.examName && exam.path === action.payload.path,
      );
      if (e) {
        e.selectedIndex = action.payload.selectedIndex;
      } else {
        state.selectedApRewards.push(action.payload);
      }
    },
    setAllTransferredGEs: (state, action: PayloadAction<TransferredGE[]>) => {
      state.transferredGEs = action.payload;
    },
    setTransferredGE: (state, action: PayloadAction<TransferredGE>) => {
      const foundGE = state.transferredGEs.find((ge) => ge.geName === action.payload.geName);
      if (foundGE) Object.assign(foundGE, action.payload);
      else state.transferredGEs.push(action.payload);
    },
    setUncategorizedCourses: (state, action: PayloadAction<TransferredUncategorized[]>) => {
      state.uncategorizedCourses = action.payload;
    },
    addUncategorizedCourse: (state, action: PayloadAction<TransferredUncategorized>) => {
      state.uncategorizedCourses.push(action.payload);
    },
    updateUncategorizedCourse: (state, action: PayloadAction<TransferredUncategorized>) => {
      const course = state.uncategorizedCourses.find((course) => course.name === action.payload.name);
      if (course) {
        course.units = action.payload.units;
      }
    },
    removeUncategorizedCourse: (state, action: PayloadAction<TransferredUncategorized>) => {
      state.uncategorizedCourses = state.uncategorizedCourses.filter(
        (course) => course.name !== action.payload.name || course.units !== action.payload.units,
      );
    },
    clearUnreadTransfers: (state) => {
      for (const course of state.transferredCourses) {
        delete course.unread;
      }
      for (const ap of state.userAPExams) {
        delete ap.unread;
      }
      for (const other of state.uncategorizedCourses) {
        delete other.unread;
      }
    },
  },
});

export const {
  setShowMobileCreditsMenu,
  setDataLoadState,
  addTransferredCourse,
  removeTransferredCourse,
  updateTransferredCourse,
  setTransferredCourses,
  setAPExams,
  setUserAPExams,
  addUserAPExam,
  removeUserAPExam,
  updateUserExam,
  setSelectedApRewards,
  addSelectedApReward,
  updateSelectedApReward,
  setAllTransferredGEs,
  setTransferredGE,
  setUncategorizedCourses,
  addUncategorizedCourse,
  updateUncategorizedCourse,
  removeUncategorizedCourse,
  clearUnreadTransfers,
} = transferCreditsSlice.actions;

export default transferCreditsSlice.reducer;
