import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MajorProgram, MajorSpecialization, ProgramRequirement, MinorProgram } from '@peterportal/types';

export type RequirementsTabName = 'Major' | 'Minor' | 'GE' | 'Saved' | 'Search';

export interface MajorWithSpecialization {
  major: MajorProgram;
  selectedSpec: MajorSpecialization | null;
  specializations: MajorSpecialization[];
  requirements: ProgramRequirement[];
}

type ExpandedGroupsList = { [key: string]: boolean | undefined };

export interface MinorRequirements {
  minor: MinorProgram;
  requirements: ProgramRequirement[];
}

const courseRequirementsSlice = createSlice({
  name: 'courseRequirements',
  initialState: {
    selectedTab: 'Major' as RequirementsTabName,
    majorList: [] as MajorProgram[],
    selectedMajors: [] as MajorWithSpecialization[],
    specialization: null as MajorSpecialization | null,
    minorList: [] as MinorProgram[],
    selectedMinors: [] as MinorRequirements[],
    MinorRequirements: [] as ProgramRequirement[],
    geRequirements: [] as ProgramRequirement[],
    completedMarkers: {} as Record<string, boolean>,
    expandedGroups: {} as ExpandedGroupsList,
  },
  reducers: {
    setSelectedTab: (state, action: PayloadAction<RequirementsTabName>) => {
      state.selectedTab = action.payload;
    },
    setMajorList: (state, action: PayloadAction<MajorProgram[]>) => {
      state.majorList = action.payload;
    },
    addMajor: (state, action: PayloadAction<MajorProgram>) => {
      if (!state.selectedMajors.find((m) => m.major.id === action.payload.id)) {
        state.selectedMajors.push({
          major: action.payload,
          selectedSpec: null,
          specializations: [],
          requirements: [],
        });
        state.expandedGroups[`major-${action.payload.id}`] = true;
      }
    },
    removeMajor: (state, action: PayloadAction<string>) => {
      state.selectedMajors = state.selectedMajors.filter((m) => m.major.id !== action.payload);
    },
    setSpecialization: (
      state,
      action: PayloadAction<{ majorId: string; specialization: MajorSpecialization | null }>,
    ) => {
      const major = state.selectedMajors.find((m) => m.major.id === action.payload.majorId);
      if (major) {
        major.selectedSpec = action.payload.specialization;
      }
    },
    setMajorSpecs: (state, action: PayloadAction<{ majorId: string; specializations: MajorSpecialization[] }>) => {
      const major = state.selectedMajors.find((m) => m.major.id === action.payload.majorId);
      if (major) {
        major.specializations = action.payload.specializations;
      }
    },
    setRequirements: (state, action: PayloadAction<{ majorId: string; requirements: ProgramRequirement[] }>) => {
      const major = state.selectedMajors.find((m) => m.major.id === action.payload.majorId);
      if (major) {
        major.requirements = action.payload.requirements;
      }
    },
    setMinorRequirements: (state, action: PayloadAction<{ minorId: string; requirements: ProgramRequirement[] }>) => {
      const minor = state.selectedMinors.find((m) => m.minor.id === action.payload.minorId);
      if (minor) {
        minor.requirements = action.payload.requirements;
      }
    },
    setMinorList: (state, action: PayloadAction<MinorProgram[]>) => {
      state.minorList = action.payload;
    },
    addMinor: (state, action: PayloadAction<MinorProgram>) => {
      if (!state.selectedMinors.find((m) => m.minor.id === action.payload.id)) {
        state.selectedMinors.push({
          minor: action.payload,
          requirements: [],
        });
        state.expandedGroups[`minor-${action.payload.id}`] = true;
      }
    },
    removeMinor: (state, action: PayloadAction<string>) => {
      state.selectedMinors = state.selectedMinors.filter((m) => m.minor.id !== action.payload);
    },
    setGERequirements: (state, action: PayloadAction<ProgramRequirement[]>) => {
      state.geRequirements = action.payload;
    },
    setMarkerComplete: (state, action: PayloadAction<{ markerName: string; complete: boolean }>) => {
      state.completedMarkers[action.payload.markerName] = action.payload.complete;
    },
    initializeCompletedMarkers: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((markerName) => {
        state.completedMarkers[markerName] = true;
      });
    },
    setGroupExpanded: (state, action: PayloadAction<{ storeKey: string; expanded: boolean }>) => {
      if (action.payload.expanded) {
        state.expandedGroups[action.payload.storeKey] = true;
      } else {
        delete state.expandedGroups[action.payload.storeKey];
      }
    },
  },
});

export const {
  setSelectedTab,
  setMajorList,
  addMajor,
  removeMajor,
  setSpecialization,
  setMajorSpecs,
  setRequirements,
  setMinorList,
  addMinor,
  removeMinor,
  setMinorRequirements,
  setGERequirements,
  setMarkerComplete,
  initializeCompletedMarkers,
  setGroupExpanded,
} = courseRequirementsSlice.actions;

export default courseRequirementsSlice.reducer;
