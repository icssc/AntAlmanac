import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultYear } from '../../helpers/planner';
import {
  CourseGQLData,
  CourseIdentifier,
  InvalidCourseData,
  PlannerQuarterData,
  PlannerYearData,
  RoadmapPlan,
  RoadmapPlanState,
  RoadmapRevision,
} from '../../types/types';
import type { RootState } from '../store';
import { restoreRevision } from '../../helpers/roadmap';
import { LOADING_COURSE_PLACEHOLDER } from '../../helpers/courseRequirements';
import { ToastSeverity } from '../../helpers/toast';

// Define the initial state using that type
export const initialPlanState: RoadmapPlanState = {
  yearPlans: [defaultYear() as PlannerYearData],
  invalidCourses: [],
};

// default plan to display for uesr
export const defaultPlan: RoadmapPlan = {
  id: -1,
  name: "Peter's Roadmap",
  content: initialPlanState,
};

/** added for multiple planner */

// Payload to pass in to move a course
export interface MoveCoursePayload {
  from: CourseIdentifier;
  to: CourseIdentifier;
}

interface SetActiveCoursePayload {
  course: CourseGQLData;
  startYear?: number;
  quarter?: PlannerQuarterData;
  courseIndex?: number;
}

export const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState: {
    plans: [defaultPlan],
    revisions: [] as RoadmapRevision[],
    currentRevisionIndex: 0,
    /** The index of the revision where the user last saved the roadmap */
    savedRevisionIndex: 0,
    currentPlanIndex: 0,
    /** Whether to alert the user of unsaved changes before leaving */
    unsavedChanges: false,
    /** Selected quarter and year for adding a course on mobile */
    currentYearAndQuarter: null as { year: number; quarter: number } | null,
    /** Whether to show the search bar on mobile */
    showMobileCatalog: false,
    /** Whether to show the add course modal on mobile */
    showAddCourse: false,
    showSavedCourses: true,
    showMobileFullscreenSearch: false,
    /** Store the course data of the active dragging item */
    activeCourse: null as CourseGQLData | null,
    /** true if we start dragging a course whose info hasn't fully loaded yet, i.e. from Degree Requirements */
    activeCourseLoading: false,
    /** Store missing prerequisites for courses when adding on mobile */
    activeMissingPrerequisites: undefined as string[] | undefined,
    /** Where the active course is being dragged from */
    activeCourseDragSource: null as Omit<SetActiveCoursePayload, 'course'> | null,
    /** Whether the roadmap is loading */
    roadmapLoading: true,
    toastMsg: '',
    toastSeverity: 'info' as ToastSeverity,
    showToast: false,
  },
  reducers: {
    // Roadmap Window State

    setInitialPlannerData: (
      state,
      action: PayloadAction<{ plans: RoadmapPlan[]; timestamp: number; currentPlanIndex?: number }>,
    ) => {
      state.plans = action.payload.plans;
      state.currentPlanIndex = action.payload.currentPlanIndex ?? 0;
      const revision: RoadmapRevision = {
        timestamp: action.payload.timestamp ?? Date.now(),
        edits: [],
      };
      state.revisions = [revision];
    },
    setRoadmapLoading: (state, action: PayloadAction<boolean>) => {
      state.roadmapLoading = action.payload;
    },

    // Modifying the Roadmap

    reviseRoadmap: (state, action: PayloadAction<RoadmapRevision>) => {
      const currentIndex = state.currentRevisionIndex;
      state.revisions.splice(currentIndex + 1, state.revisions.length, action.payload);
      restoreRevision(state.plans, state.revisions, currentIndex, currentIndex + 1);
      state.currentRevisionIndex++;
    },
    undoRoadmapRevision: (state) => {
      if (state.currentRevisionIndex <= 0) return;
      restoreRevision(state.plans, state.revisions, state.currentRevisionIndex, state.currentRevisionIndex - 1);
      state.currentRevisionIndex--;
      if (state.currentPlanIndex > state.plans.length - 1) {
        state.currentPlanIndex = state.plans.length - 1;
      }
    },
    redoRoadmapRevision: (state) => {
      if (state.currentRevisionIndex >= state.revisions.length - 1) return;
      restoreRevision(state.plans, state.revisions, state.currentRevisionIndex, state.currentRevisionIndex + 1);
      state.currentRevisionIndex++;
    },
    setSavedRevisionIndex: (state, action: PayloadAction<number>) => {
      state.savedRevisionIndex = action.payload;
    },

    // Intermediate States When Adding Courses

    setActiveCourse: (state, action: PayloadAction<SetActiveCoursePayload | null>) => {
      if (!action.payload) {
        state.activeCourse = state.activeCourseDragSource = null;
        return;
      }
      const { course, ...dragSource } = action.payload;
      state.activeCourse = course;
      state.activeCourseDragSource = dragSource.quarter ? dragSource : null;
    },
    setActiveCourseLoading: (state, action: PayloadAction<boolean>) => {
      state.activeCourseLoading = action.payload;
    },
    setActiveMissingPrerequisites: (state, action: PayloadAction<string[] | undefined>) => {
      state.activeMissingPrerequisites = action.payload;
    },
    /**
     * Creates a loading placeholder in the specified position. This placeholder automatically gets
     * removed when creating a revision to add a course to the user's roadmap.
     */
    createQuarterCourseLoadingPlaceholder: (state, action: PayloadAction<CourseIdentifier>) => {
      const target = action.payload;
      const yearPlans = state.plans[state.currentPlanIndex].content.yearPlans;
      const quarter = yearPlans[target.yearIndex].quarters[target.quarterIndex];
      quarter.courses.splice(target.courseIndex, 0, LOADING_COURSE_PLACEHOLDER);
    },
    setInvalidCourses: (state, action: PayloadAction<InvalidCourseData[]>) => {
      state.plans[state.currentPlanIndex].content.invalidCourses = action.payload;
    },

    // Controlling Visibility of UI Elements

    hideMobileCatalog: (state) => {
      state.showMobileCatalog = false;
    },
    showMobileCatalog: (state, action: PayloadAction<{ year: number; quarter: number }>) => {
      state.showMobileCatalog = true;
      state.currentYearAndQuarter = action.payload;
    },
    setShowMobileFullscreenSearch: (state, action: PayloadAction<boolean>) => {
      state.showMobileFullscreenSearch = action.payload;
    },
    setShowAddCourse: (state, action: PayloadAction<boolean>) => {
      state.showAddCourse = action.payload;
    },
    setPlanIndex: (state, action: PayloadAction<number>) => {
      state.currentPlanIndex = action.payload;
    },
    setShowSavedCourses: (state, action: PayloadAction<boolean>) => {
      state.showSavedCourses = action.payload;
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
    setCHCSelection: (state, action: PayloadAction<{ plannerId: number; chc: '' | 'CHC4' | 'CHC2' }>) => {
      const plan = state.plans.find((p) => p.id === action.payload.plannerId);
      if (plan) {
        plan.chc = action.payload.chc;
      }
    },

    // Update the planner IDs of newly created planners that still have temporary (negative) IDs

    updateTempPlannerIds: (state, action: PayloadAction<Record<number, number>>) => {
      if (Object.keys(action.payload).length === 0) return;
      state.plans.forEach((plan) => {
        plan.id = action.payload[plan.id] ?? plan.id;
      });
    },
  },
});

export const {
  createQuarterCourseLoadingPlaceholder,
  setActiveCourse,
  setActiveCourseLoading,
  setActiveMissingPrerequisites,
  setInitialPlannerData,
  setInvalidCourses,
  hideMobileCatalog,
  showMobileCatalog,
  setShowMobileFullscreenSearch,
  setShowAddCourse,
  setPlanIndex,
  setShowSavedCourses,
  setRoadmapLoading,
  reviseRoadmap,
  undoRoadmapRevision,
  redoRoadmapRevision,
  setSavedRevisionIndex,
  setToastMsg,
  setToastSeverity,
  setShowToast,
  setCHCSelection,
  updateTempPlannerIds,
} = roadmapSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectYearPlans = (state: RootState) =>
  state.roadmap.plans[state.roadmap.currentPlanIndex].content.yearPlans;

export const selectAllPlans = (state: RootState) => state.roadmap.plans;

export const selectCurrentPlan = (state: RootState) => state.roadmap.plans[state.roadmap.currentPlanIndex];

export const getNextPlannerTempId = (state: RootState) => {
  return Math.min(0, ...state.roadmap.plans.map((p) => p.id)) - 1;
};

export default roadmapSlice.reducer;
