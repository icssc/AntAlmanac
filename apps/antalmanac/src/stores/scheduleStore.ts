import { create } from 'zustand';

import type { ScheduleCourse, ScheduleSaveState, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { Schedules } from '$stores/Schedules';

import actionTypesStore from '$actions/ActionTypesStore';
import type {
    AddCourseAction,
    DeleteCourseAction,
    AddCustomEventAction,
    DeleteCustomEventAction,
    EditCustomEventAction,
    ChangeCustomEventColorAction,
    ClearScheduleAction,
    CopyScheduleAction,
    RenameScheduleAction,
    DeleteScheduleAction,
    ChangeCourseColorAction,
    AddScheduleAction,
} from '$actions/ActionTypesStore';
import EventEmitter from 'events';

interface ScheduleStoreState {
    // State
    schedule: Schedules;
    customEvents: RepeatingCustomEvent[];
    eventsInCalendar: any[];
    finalsEventsInCalendar: any[];
    unsavedChanges: boolean;
    skeletonMode: boolean;
    colorPickers: Record<string, EventEmitter>;
  
    // Getters
    getNextScheduleName: (scheduleIndex: number, newScheduleName: string) => string;
    getDefaultScheduleName: () => string;
    getCurrentScheduleIndex: () => number;
    getScheduleNames: () => string[];
    getAddedCourses: () => ScheduleCourse[];
    getCustomEvents: () => RepeatingCustomEvent[];
    getSkeletonMode: () => boolean;
    getCurrentSkeletonSchedule: () => any;
    getSkeletonScheduleNames: () => string[];
    getEventsInCalendar: () => any[];
    getEventsWithFinalsInCalendar: () => any[];
    getCourseEventsInCalendar: () => any[];
    getCustomEventsInCalendar: () => any[];
    getFinalEventsInCalendar: () => any[];
    hasUnsavedChanges: () => boolean; 
    getAddedSectionCodes: () => Set<string>;
    getCurrentScheduleNote: () => string;
  
    // Actions
    addCourse: (newCourse: ScheduleCourse, scheduleIndex?: number) => void;
    deleteCourse: (sectionCode: string, term: string, triggerUnsavedWarning?: boolean) => void;
    deleteCourses: (sectionCodes: string[], term: string, triggerUnsavedWarning?: boolean) => void;
    addCustomEvent: (customEvent: RepeatingCustomEvent, scheduleIndices: number[]) => void;
    editCustomEvent: (editedCustomEvent: RepeatingCustomEvent, newScheduleIndices: number[]) => void;
    deleteCustomEvent: (customEventId: number) => void;
    changeCustomEventColor: (customEventId: number, newColor: string) => void;
    addSchedule: (newScheduleName: string) => void;
    renameSchedule: (scheduleIndex: number, newScheduleName: string) => void;
    copySchedule: (scheduleIndex: number, newScheduleName: string) => void;
    loadSchedule: (savedSchedule: ScheduleSaveState) => Promise<boolean>;
    loadSkeletonSchedule: (savedSchedule: ScheduleSaveState) => void;
    changeCurrentSchedule: (newScheduleIndex: number) => void;
    clearSchedule: () => void;
    deleteSchedule: (scheduleIndex: number) => void;
    registerColorPicker: (id: string, update: (color: string) => void) => void;
    unregisterColorPicker: (id: string, update: (color: string) => void) => void;
    changeCourseColor: (sectionCode: string, term: string, newColor: string) => void;
    saveSchedule: () => void;
    updateScheduleNote: (newScheduleNote: string, scheduleIndex: number) => void;
    termsInSchedule: (term: string) => Set<string>;
  }

  export const useScheduleStore = create<ScheduleStoreState>((set, get) => ({
    // State
    schedule: new Schedules(),
    customEvents: [],
    eventsInCalendar: [],
    finalsEventsInCalendar: [],
    unsavedChanges: false,
    skeletonMode: false,
    colorPickers: {},
  
    // Getters
    getNextScheduleName: (scheduleIndex, newScheduleName) => get().schedule.getNextScheduleName(scheduleIndex, newScheduleName),
    getDefaultScheduleName: () => get().schedule.getDefaultScheduleName(),
    getCurrentScheduleIndex: () => get().schedule.getCurrentScheduleIndex(),
    getScheduleNames: () => get().schedule.getScheduleNames(),
    getAddedCourses: () => get().schedule.getAllCourses(),
    getCustomEvents: () => get().schedule.getAllCustomEvents(),
    getSkeletonMode: () => get().skeletonMode,
    getCurrentSkeletonSchedule: () => get().schedule.getCurrentSkeletonSchedule(),
    getSkeletonScheduleNames: () => get().schedule.getSkeletonScheduleNames(),
    getEventsInCalendar: () => get().schedule.getCalendarizedEvents(),
    getEventsWithFinalsInCalendar: () => [
      ...get().schedule.getCalendarizedEvents(),
      ...get().schedule.getCalendarizedFinals(),
    ],
    getCourseEventsInCalendar: () => get().schedule.getCalendarizedCourseEvents(),
    getCustomEventsInCalendar: () => get().schedule.getCalendarizedCustomEvents(),
    getFinalEventsInCalendar: () => get().schedule.getCalendarizedFinals(),
    hasUnsavedChanges: () => get().unsavedChanges,
    getAddedSectionCodes: () => get().schedule.getAddedSectionCodes(),
    getCurrentScheduleNote: () => get().schedule.getCurrentScheduleNote(),
  
    // Actions
    addCourse: (newCourse: ScheduleCourse, scheduleIndex: number = get().schedule.getCurrentScheduleIndex()) => {
        let addedCourse: ScheduleCourse;
        if (scheduleIndex === get().schedule.getNumberOfSchedules()) {
          addedCourse = get().schedule.addCourseToAllSchedules(newCourse);
        } else {
          addedCourse = get().schedule.addCourse(newCourse, scheduleIndex);
        }
    
        set({ unsavedChanges: true });
        const action: AddCourseAction = {
          type: 'addCourse',
          course: newCourse,
          scheduleIndex,
        };
        actionTypesStore.autoSaveSchedule(action);
        return addedCourse;
    },
  
    deleteCourse: (sectionCode: string, term: string, triggerUnsavedWarning = true) => {
      get().schedule.deleteCourse(sectionCode, term);
      set({ unsavedChanges: triggerUnsavedWarning });
      const action: DeleteCourseAction = {
        type: 'deleteCourse',
        sectionCode,
        term,
      };
      actionTypesStore.autoSaveSchedule(action);
    },
  
    deleteCourses: (sectionCodes: string[], term: string, triggerUnsavedWarning = true) => {
      sectionCodes.forEach((sectionCode) => get().deleteCourse(sectionCode, term, triggerUnsavedWarning));
    },
  
    addCustomEvent: (customEvent: RepeatingCustomEvent, scheduleIndices: number[]) => {
      get().schedule.addCustomEvent(customEvent, scheduleIndices);
      set({ unsavedChanges: true });
      const action: AddCustomEventAction = {
        type: 'addCustomEvent',
        customEvent,
        scheduleIndices,
      };
      actionTypesStore.autoSaveSchedule(action);
    },
  
    editCustomEvent: (editedCustomEvent: RepeatingCustomEvent, newScheduleIndices: number[]) => {
      get().schedule.editCustomEvent(editedCustomEvent, newScheduleIndices);
      set({ unsavedChanges: true });
      const action: EditCustomEventAction = {
        type: 'editCustomEvent',
        editedCustomEvent,
        newScheduleIndices,
      };
      actionTypesStore.autoSaveSchedule(action);
    },
  
    deleteCustomEvent: (customEventId: number) => {
      get().schedule.deleteCustomEvent(customEventId);
      set({ unsavedChanges: true });
      const action: DeleteCustomEventAction = {
        type: 'deleteCustomEvent',
        customEventId,
      };
      actionTypesStore.autoSaveSchedule(action);
    },

    registerColorPicker: (id: string, update: (color: string) => void) => {
      set((state) => ({
        colorPickers: {
            ...state.colorPickers,
            [id]: state.colorPickers[id] || new EventEmitter(),
        },
      }));
      get().colorPickers[id].on('colorChange', update);
    },
    
    unregisterColorPicker: (id: string, update: (color: string) => void) => {
      const pickers = get().colorPickers;

      if (pickers[id]) {
          pickers[id].removeListener('colorChange', update);

          set((state) => {
              const updatedPickers = { ...state.colorPickers };
              if (updatedPickers[id] && updatedPickers[id].listenerCount('colorChange') === 0) {
                  delete updatedPickers[id];
              }
              return { colorPickers: updatedPickers };
          });
      }
    },
  
    changeCustomEventColor: (customEventId: number, newColor: string) => {
      get().schedule.changeCustomEventColor(customEventId, newColor);
      set({ unsavedChanges: true });
      const action: ChangeCustomEventColorAction = {
        type: 'changeCustomEventColor',
        customEventId,
        newColor,
      };
      actionTypesStore.autoSaveSchedule(action);
      const pickers = get().colorPickers;
      if (pickers[customEventId]) {
          pickers[customEventId].emit('colorChange', newColor);
      }
    },

    changeCourseColor: (sectionCode: string, term: string, newColor: string) => {
      get().schedule.changeCourseColor(sectionCode, term, newColor);
      set({ unsavedChanges: true });
      const action: ChangeCourseColorAction = {
        type: 'changeCourseColor',
        sectionCode,
        term,
        newColor,
      };
      actionTypesStore.autoSaveSchedule(action);
      const pickers = get().colorPickers;
      if (pickers[sectionCode]) {
          pickers[sectionCode].emit('colorChange', newColor);
      }
    },
  
    addSchedule: (newScheduleName: string) => {
      get().schedule.addNewSchedule(newScheduleName);
      set({ unsavedChanges: true });
      const action: AddScheduleAction = {
        type: 'addSchedule',
        newScheduleName,
      };
      actionTypesStore.autoSaveSchedule(action);
    },
  
    renameSchedule: (scheduleIndex: number, newScheduleName: string) => {
      get().schedule.renameSchedule(scheduleIndex, newScheduleName);
      set({ unsavedChanges: true });
      const action: RenameScheduleAction = {
        type: 'renameSchedule',
        scheduleIndex,
        newScheduleName,
      };
      actionTypesStore.autoSaveSchedule(action);
    },
  
    copySchedule: (scheduleIndex: number, newScheduleName: string) => {
      get().schedule.copySchedule(scheduleIndex, newScheduleName);
      set({ unsavedChanges: true });
      const action: CopyScheduleAction = {
        type: 'copySchedule',
        scheduleIndex,
        newScheduleName,
      };
      actionTypesStore.autoSaveSchedule(action);
    },
  
    loadSchedule: async (savedSchedule: ScheduleSaveState) => {
      try {
        await get().schedule.fromScheduleSaveState(savedSchedule);
        await actionTypesStore.loadScheduleFromLocalSave();
        set({ unsavedChanges: false });
        return true;
      } catch {
        return false;
      }
    },
  
    loadSkeletonSchedule: (savedSchedule: ScheduleSaveState) => {
      get().schedule.setSkeletonSchedules(savedSchedule.schedules);
      set({ skeletonMode: true });
    },
  
    changeCurrentSchedule: (newScheduleIndex: number) => {
      get().schedule.setCurrentScheduleIndex(newScheduleIndex);
      set({});
    },
  
    clearSchedule: () => {
      get().schedule.clearCurrentSchedule();
      set({ unsavedChanges: true });
      const action: ClearScheduleAction = {
        type: 'clearSchedule',
      };
      actionTypesStore.autoSaveSchedule(action);
    },
  
    deleteSchedule: (scheduleIndex: number) => {
      get().schedule.deleteSchedule(scheduleIndex);
      set({ unsavedChanges: true });
      const action: DeleteScheduleAction = {
        type: 'deleteSchedule',
        scheduleIndex,
      };
      actionTypesStore.autoSaveSchedule(action);
    },
  
    saveSchedule: () => {
      set({ unsavedChanges: false });
      window.localStorage.removeItem('unsavedActions');
    },
  
    updateScheduleNote: (newScheduleNote, scheduleIndex) => {
      get().schedule.updateScheduleNote(newScheduleNote, scheduleIndex);
    },

    termsInSchedule: (term: string) =>
        new Set([term, ...get().schedule.getCurrentCourses().map((course) => course.term)]),
  }));
  