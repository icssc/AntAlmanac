import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { EditReviewSubmission, ReviewData } from '@peterportal/types';
import { ToastSeverity } from '../../helpers/toast';

// Define a type for the slice state
interface ReviewState {
  reviews: ReviewData[];
  reviewOrder: number[];
  formOpen: boolean;
  toastMsg: string;
  toastSeverity: ToastSeverity;
  showToast: boolean;
}

// Define the initial state using that type
const initialState: ReviewState = {
  reviews: [],
  reviewOrder: [],
  formOpen: false,
  toastMsg: '',
  toastSeverity: 'info' as ToastSeverity,
  showToast: false,
};

export const reviewSlice = createSlice({
  name: 'review',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    addReview: (state, action: PayloadAction<ReviewData>) => {
      state.reviews.push(action.payload);
    },
    setReviews: (state, action: PayloadAction<ReviewData[]>) => {
      state.reviews = action.payload;
    },
    setReviewOrder: (state, action: PayloadAction<number[]>) => {
      state.reviewOrder = action.payload;
    },
    editReview: (state, action: PayloadAction<EditReviewSubmission>) => {
      const i = state.reviews.findIndex((review) => review.id === action.payload.id);
      state.reviews[i] = { ...state.reviews[i], ...action.payload }; // overwrite with edited properties
    },
    setFormStatus: (state, action: PayloadAction<boolean>) => {
      state.formOpen = action.payload;
    },
    toggleFormStatus: (state) => {
      state.formOpen = !state.formOpen;
    },
    setToastMsg: (state, action: PayloadAction<string>) => {
      state.toastMsg = action.payload;
    },
    setToastSeverity: (state, action: PayloadAction<ToastSeverity>) => {
      state.toastSeverity = action.payload;
    },
    setShowToast: (state, action: PayloadAction<boolean>) => {
      state.showToast = action.payload;
    },
  },
});

export const {
  addReview,
  setReviews,
  setReviewOrder,
  editReview,
  setFormStatus,
  toggleFormStatus,
  setToastMsg,
  setToastSeverity,
  setShowToast,
} = reviewSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectReviews = (state: RootState) => state.review.reviews;
export const selectReviewOrder = (state: RootState) => state.review.reviewOrder;

export default reviewSlice.reducer;
