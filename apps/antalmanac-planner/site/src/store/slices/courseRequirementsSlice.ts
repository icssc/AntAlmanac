import { MajorProgram, MajorSpecialization, ProgramRequirement, MinorProgram } from '@peterportal/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RequirementsTabName = 'Major' | 'Minor' | 'GE' | 'Library' | 'Search';

export interface MajorWithSpecialization {
    major: MajorProgram;
    selectedSpec: MajorSpecialization | null;
    specializations: MajorSpecialization[];
    requirements: ProgramRequirement[];
    schoolRequirementCount?: number;
    catalogYear: string | null;
    fallbackCatalogYear: string | null;
}

type ExpandedGroupsList = { [key: string]: boolean | undefined };

export interface MinorRequirements {
    minor: MinorProgram;
    requirements: ProgramRequirement[];
    catalogYear: string | null;
    fallbackCatalogYear: string | null;
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
        overriddenRequirements: {} as Record<number, Record<string, boolean>>,
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
                    catalogYear: null,
                    fallbackCatalogYear: null,
                });
                state.expandedGroups[`major-${action.payload.id}`] = true;
            }
        },
        removeMajor: (state, action: PayloadAction<string>) => {
            state.selectedMajors = state.selectedMajors.filter((m) => m.major.id !== action.payload);
        },
        setSpecialization: (
            state,
            action: PayloadAction<{ majorId: string; specialization: MajorSpecialization | null }>
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
        setRequirements: (
            state,
            action: PayloadAction<{
                majorId: string;
                requirements: ProgramRequirement[];
                schoolRequirementCount?: number;
            }>
        ) => {
            const major = state.selectedMajors.find((m) => m.major.id === action.payload.majorId);
            if (major) {
                major.requirements = action.payload.requirements;
                major.schoolRequirementCount = action.payload.schoolRequirementCount ?? 0;
            }
        },
        setMajorCatalogYear: (state, action: PayloadAction<{ majorId: string; catalogYear: string | null }>) => {
            const major = state.selectedMajors.find((m) => m.major.id === action.payload.majorId);
            if (major) {
                major.catalogYear = action.payload.catalogYear;
            }
        },
        setMajorFallbackCatalogYear: (
            state,
            action: PayloadAction<{ majorId: string; fallbackCatalogYear: string | null }>
        ) => {
            const major = state.selectedMajors.find((m) => m.major.id === action.payload.majorId);
            if (major) {
                major.fallbackCatalogYear = action.payload.fallbackCatalogYear;
            }
        },
        setMinorRequirements: (
            state,
            action: PayloadAction<{ minorId: string; requirements: ProgramRequirement[] }>
        ) => {
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
                    catalogYear: null,
                    fallbackCatalogYear: null,
                });
                state.expandedGroups[`minor-${action.payload.id}`] = true;
            }
        },
        removeMinor: (state, action: PayloadAction<string>) => {
            state.selectedMinors = state.selectedMinors.filter((m) => m.minor.id !== action.payload);
        },
        setMinorCatalogYear: (state, action: PayloadAction<{ minorId: string; catalogYear: string | null }>) => {
            const minor = state.selectedMinors.find((m) => m.minor.id === action.payload.minorId);
            if (minor) {
                minor.catalogYear = action.payload.catalogYear;
            }
        },
        setMinorFallbackCatalogYear: (
            state,
            action: PayloadAction<{ minorId: string; fallbackCatalogYear: string | null }>
        ) => {
            const minor = state.selectedMinors.find((m) => m.minor.id === action.payload.minorId);
            if (minor) {
                minor.fallbackCatalogYear = action.payload.fallbackCatalogYear;
            }
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
        setRequirementOverride: (
            state,
            action: PayloadAction<{ plannerId: number; requirement: string; override: boolean }>
        ) => {
            if (!state.overriddenRequirements[action.payload.plannerId]) {
                state.overriddenRequirements[action.payload.plannerId] = {};
            }
            state.overriddenRequirements[action.payload.plannerId][action.payload.requirement] =
                action.payload.override;
        },
        initializeOverriddenRequirements: (
            state,
            action: PayloadAction<{ plannerId: number; requirements: string[] }>
        ) => {
            state.overriddenRequirements[action.payload.plannerId] = {};
            action.payload.requirements.forEach((requirement) => {
                state.overriddenRequirements[action.payload.plannerId][requirement] = true;
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
    setMajorCatalogYear,
    setMajorFallbackCatalogYear,
    setMinorList,
    addMinor,
    removeMinor,
    setMinorCatalogYear,
    setMinorFallbackCatalogYear,
    setMinorRequirements,
    setGERequirements,
    setMarkerComplete,
    initializeCompletedMarkers,
    setRequirementOverride,
    initializeOverriddenRequirements,
    setGroupExpanded,
} = courseRequirementsSlice.actions;

export default courseRequirementsSlice.reducer;
