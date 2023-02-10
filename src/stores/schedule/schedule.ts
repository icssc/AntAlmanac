import { create } from 'zustand';
import { RepeatingCustomEvent } from '$types/event';
// import { CourseInfo, getCourseInfo, queryWebsoc } from '$lib/helpers';
import { AASection } from '$types/peterportal';

/**
 * Course as stored in schedule
 */
export interface ScheduleCourse {
  courseComment: string;
  courseNumber: string; // e.g. 122a
  courseTitle: string;
  deptCode: string;
  prerequisiteLink: string;
  section: AASection;
  term: string;
}

/**
 * User's schedule
 */
export interface Schedule {
  scheduleName: string;
  courses: ScheduleCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * Shortened course for saving in DB
 */
interface ShortCourse {
  color: string;
  term: string;
  sectionCode: string;
}

/**
 * Schedule of short courses that is saved to DB
 */
export interface ShortCourseSchedule {
  scheduleName: string;
  courses: ShortCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * schedule save state
 */
export interface ScheduleSaveState {
  schedules: ShortCourseSchedule[];
  scheduleIndex: number;
}

/**
 * schedule undo state
 */
export interface ScheduleUndoState {
  schedules: Schedule[];
  scheduleIndex: number;
}

/**
 * the schedule store is shared state that defines some primitive operations
 * it should be extended by using the `setState` function
 */
interface ScheduleStore {
  schedules: Schedule[];
  scheduleIndex: number;
  previousStates: ScheduleUndoState[];

  getScheduleName: () => string;
  getScheduleNames: () => string[];
  getNumSchedules: () => number;
  getCourses: () => ScheduleCourse[];
  getAllCourses: () => ScheduleCourse[];
  getSectionCodes: () => Set<string>;

  addUndoState: () => void;
  revertState: () => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  /**
   * the currently loaded schedules
   */
  schedules: [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }],

  /**
   * index of current schedule
   */
  scheduleIndex: 0,

  /**
   * undo list
   */
  previousStates: [],

  /**
   * number of schedules
   */
  getNumSchedules() {
    return get().schedules.length;
  },

  /**
   * names of all schedules
   */
  getScheduleNames() {
    return get().schedules.map((schedule) => schedule.scheduleName);
  },

  /**
   * name of current schedule
   */
  getScheduleName() {
    const currentSchedules = get().schedules;
    const currentScheduleIndex = get().scheduleIndex;
    return currentSchedules[currentScheduleIndex].scheduleName;
  },

  /**
   * courses in current schedule
   */
  getCourses() {
    return get().schedules[get().scheduleIndex].courses;
  },

  /**
   * all courses in all schedules
   */
  getAllCourses() {
    const schedules = get().schedules;
    return schedules.map((schedule) => schedule.courses).flat(1);
  },

  /**
   * section codes
   */
  getSectionCodes() {
    const courses = get().getCourses();
    return new Set(courses.map((course) => `${course.section.sectionCode} ${course.term}`));
  },

  addUndoState() {
    const currentSchedules = get().schedules;
    const currentPreviousStates = get().previousStates;
    const currentScheduleIndex = get().scheduleIndex;

    const newPreviousState = {
      schedules: structuredClone(currentSchedules),
      scheduleIndex: currentScheduleIndex,
    };

    const previousStates = [...currentPreviousStates, newPreviousState].slice(-50);

    set({ previousStates });
  },

  /**
   * pop a state entry from the undo array and set it as the current state
   */
  revertState() {
    const state = get().previousStates.pop();

    if (state !== undefined) {
      set(state);
    }
  },
}));

// /**
//  * set the current schedule via index
//  * @param scheduleIndex index of the new schedule
//  */
// setScheduleIndex(scheduleIndex: number) {
//   get().addUndoState();
//   set({ scheduleIndex });
// },

// /**
//  * add a new, empty schedule
//  * @param scheduleName name of the new schedule
//  */
// addNewSchedule(scheduleName: string) {
//   get().addUndoState();
//   const currentSchedules = get().schedules;
//   const schedules = [...currentSchedules, { scheduleName, courses: [], customEvents: [] }];
//   set({ schedules, scheduleIndex: schedules.length - 1 });
// },

// /**
//  * rename a schedule
//  * @param newScheduleName new name of the schedule
//  * @param scheduleIndex index of the schedule
//  */
// renameSchedule(newScheduleName: string, scheduleIndex: number) {
//   get().addUndoState();
//   const schedules = get().schedules;
//   schedules[scheduleIndex].scheduleName = newScheduleName;
//   set({ schedules });
// },

// /**
//  * clear all events on the current schedule
//  */
// clearCurrentSchedule() {
//   get().addUndoState();
//   const schedules = get().schedules;
//   const scheduleIndex = get().scheduleIndex;
//   schedules[scheduleIndex].courses = [];
//   schedules[scheduleIndex].customEvents = [];
//   set({ schedules });
// },

// /**
//  * remove the current schedule from the schedules array
//  */
// deleteCurrentSchedule() {
//   get().addUndoState();
//   const schedules = get().schedules;
//   const scheduleIndex = get().scheduleIndex;
//   schedules.splice(scheduleIndex, 1);
//   set({ schedules, scheduleIndex: Math.min(scheduleIndex, schedules.length - 1) });
// },

// /**
//  * copy the current schedule to another schedule
//  * @param to index of the other schedule
//  */
// copySchedule(to: number) {
//   get().addUndoState();
//   const currentSchedules = get().schedules;
//   const currentScheduleIndex = get().scheduleIndex;
//   const currentCourses = currentSchedules[currentScheduleIndex].courses;
//   for (const course of currentCourses) {
//     if (to === currentSchedules.length) {
//       get().addCourseToAllSchedules(course);
//     } else {
//       get().addCourse(course, to, false);
//     }
//   }
// },

// /**
//  * add a course to a schedule
//  */
// addCourse(newCourse: ScheduleCourse, scheduleIndex: number = get().scheduleIndex, addUndoState = true) {
//   if (addUndoState) {
//     get().addUndoState();
//   }
//   const schedules = get().schedules;
//   const allCourses = schedules.map((schedule) => schedule.courses).flat(1);
//   /**
//    * attempt to find the course to add
//    */
//   let courseToAdd = allCourses.find(
//     (course) => course.section.sectionCode === newCourse.section.sectionCode && course.term === newCourse.term
//   );
//   /**
//    * create a new course if it didn't exist
//    */
//   if (courseToAdd === undefined) {
//     const setOfUsedColors = new Set(allCourses.map((course) => course.section.color));
//     const color = arrayOfColors.find((materialColor) => !setOfUsedColors.has(materialColor)) || '#5ec8e0';
//     courseToAdd = {
//       ...newCourse,
//       section: {
//         ...newCourse.section,
//         color,
//       },
//     };
//   }
//   /**
//    * add the course to the current schedule if not present and update the store
//    */
//   if (
//     !schedules[scheduleIndex].courses.some((course) => course.section.sectionCode === courseToAdd.section.sectionCode)
//   ) {
//     schedules[scheduleIndex].courses.push(courseToAdd);
//     set({ schedules });
//   }
// },

// /**
//  * add a course to all schedules
//  * @param newCourse course to add
//  */
// addCourseToAllSchedules(newCourse: ScheduleCourse) {
//   get().addUndoState();
//   const schedules = get().schedules;
//   for (let i = 0; i < schedules.length; ++i) {
//     get().addCourse(newCourse, i, false);
//   }
// },

// /**
//  * change a course's color
//  * @param sectionCode section code
//  * @param term term
//  * @param newColor color
//  */
// changeCourseColor(sectionCode: string, term: string, newColor: string) {
//   get().addUndoState();
//   const schedules = get().schedules;
//   const course = schedules
//     .map((schedule) => schedule.courses)
//     .flat(1)
//     .find((course) => course.section.sectionCode === sectionCode && course.term === term);
//   if (course) {
//     course.section.color = newColor;
//     set({ schedules });
//   }
// },

// /**
//  * delete a course from schedule
//  * @param sectionCode section code
//  * @param term term
//  */
// deleteCourse(sectionCode: string, term: string) {
//   get().addUndoState();
//   const schedules = get().schedules;
//   const scheduleIndex = get().scheduleIndex;
//   const currentCourses = schedules[scheduleIndex].courses;
//   schedules[scheduleIndex].courses = currentCourses.filter(
//     (course) => !(course.section.sectionCode === sectionCode && course.term === term)
//   );
//   set({ schedules });
// },

// /**
//  * add a custom event to multiple schedules
//  * @param newCustomEvent custom event
//  * @param scheduleIndices indices of schedules to add the custom event to
//  */
// addCustomEvent(newCustomEvent: RepeatingCustomEvent, scheduleIndices: number[]) {
//   get().addUndoState();
//   const schedules = get().schedules;
//   const scheduleIndex = get().scheduleIndex;
//   const customEvents = schedules[scheduleIndex].customEvents;
//   for (const scheduleIndex of scheduleIndices) {
//     if (!customEvents.some((customEvent) => customEvent.customEventID === newCustomEvent.customEventID)) {
//       schedules[scheduleIndex].customEvents.push(newCustomEvent);
//     }
//   }
//   set({ schedules });
// },

// /**
//  * delete a custom event
//  * @param customEventId custom event ID to delete
//  * @param scheduleIndices indices of schedules to remove the custom event from
//  */
// deleteCustomEvent(customEventId: number, scheduleIndices: number[] = [get().scheduleIndex]) {
//   get().addUndoState();
//   const schedules = get().schedules;
//   for (const scheduleIndex of scheduleIndices) {
//     const customEvents = schedules[scheduleIndex].customEvents;
//     const index = customEvents.findIndex((customEvent) => customEvent.customEventID === customEventId);
//     if (index !== undefined) {
//       customEvents.splice(index, 1);
//     }
//   }
//   set({ schedules });
// },

// editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newIndices: number[]) {
//   get().addUndoState();
//   const schedules = get().schedules;
//   const scheduleIndex = get().scheduleIndex;
//   const customEvents = schedules[scheduleIndex].customEvents;
//   let customEvent = customEvents.find((event) => event.customEventID === editedCustomEvent.customEventID);
//   if (customEvent === undefined) {
//     get().addCustomEvent(editedCustomEvent, newIndices);
//     return;
//   }

//   // Modify the original custom event so all references are updated as well
//   customEvent = { ...customEvent, ...editedCustomEvent };

//   const currentIndices = [...schedules.keys()].filter((index) =>
//     schedules[index].customEvents.some((event) => event.customEventID === editedCustomEvent.customEventID)
//   );

//   // Equivalent to currentIndices set minus newIndices
//   const indicesToDelete = currentIndices.filter((index) => !newIndices.includes(index));
//   get().deleteCustomEvent(customEvent.customEventID, indicesToDelete);

//   // Equivalent to newIndices set minus currentIndices
//   const indicesToAdd = newIndices.filter((index) => !currentIndices.includes(index));
//   get().addCustomEvent(customEvent, indicesToAdd);
// },

// /**
//  * change color of custom event
//  * @param customEventId ID of custom event
//  * @param newColor color
//  */
// changeCustomEventColor(customEventId: number, newColor: string) {
//   get().addUndoState();
//   const schedules = get().schedules;
//   const scheduleIndex = get().scheduleIndex;
//   const customEvents = schedules[scheduleIndex].customEvents;
//   const customEvent = customEvents.find((event) => event.customEventID === customEventId);
//   if (customEvent) {
//     customEvent.color = newColor;
//   }
// },

// /**
//  * append the current state to the undo array
//  */
// addUndoState() {
//   const currentSchedules = get().schedules;
//   const currentPreviousStates = get().previousStates;
//   const currentScheduleIndex = get().scheduleIndex;
//   const newPreviousState = {
//     schedules: structuredClone(currentSchedules),
//     scheduleIndex: currentScheduleIndex,
//   };
//   const previousStates = [...currentPreviousStates, newPreviousState].slice(-50);
//   set({ previousStates });
// },

// /**
//  * pop a state entry from the undo array and set it as the current state
//  */
// revertState() {
//   const state = get().previousStates.pop();
//   if (state !== undefined) {
//     set(state);
//   }
// },

// /**
//  * Convert schedule to shortened schedule (no course info) for saving.
//  */
// getScheduleAsSaveState(): ScheduleSaveState {
//   const schedules = get().schedules;
//   const shortSchedules: ShortCourseSchedule[] = schedules.map((schedule) => {
//     return {
//       scheduleName: schedule.scheduleName,
//       customEvents: schedule.customEvents,
//       courses: schedule.courses.map((course) => {
//         return {
//           color: course.section.color,
//           term: course.term,
//           sectionCode: course.section.sectionCode,
//         };
//       }),
//     };
//   });
//   return { schedules: shortSchedules, scheduleIndex: this.currentScheduleIndex };
// },

// /**
//  * Overwrites the current schedule with the input save state.
//  * @param saveState the save state to load
//  */
// async fromScheduleSaveState(saveState: ScheduleSaveState) {
//   get().addUndoState();
//   const schedules = [];
//   const scheduleIndex = saveState.scheduleIndex;

//   try {
//     /**
//      * reset the schedule and schedule index
//      */
//     set({ schedules, scheduleIndex });

//     /**
//      * Get a dictionary of all unique courses
//      */
//     const courseDict: { [key: string]: Set<string> } = {};
//     for (const schedule of saveState.schedules) {
//       for (const course of schedule.courses) {
//         if (course.term in courseDict) {
//           courseDict[course.term].add(course.sectionCode);
//         } else {
//           courseDict[course.term] = new Set([course.sectionCode]);
//         }
//       }
//     }

//     /**
//      * Get the course info for each course
//      */
//     const courseInfoDict = new Map<string, { [sectionCode: string]: CourseInfo }>();
//     for (const [term, courseSet] of Object.entries(courseDict)) {
//       const params = {
//         term: term,
//         sectionCodes: Array.from(courseSet).join(','),
//       };
//       const jsonResp = await queryWebsoc(params);
//       courseInfoDict.set(term, getCourseInfo(jsonResp));
//     }

//     /**
//      * Map course info to courses and transform shortened schedule to normal schedule
//      */
//     for (const shortCourseSchedule of saveState.schedules) {
//       const courses: ScheduleCourse[] = [];
//       for (const shortCourse of shortCourseSchedule.courses) {
//         const courseInfoMap = courseInfoDict.get(shortCourse.term);
//         if (courseInfoMap !== undefined) {
//           const courseInfo = courseInfoMap[shortCourse.sectionCode];
//           courses.push({
//             ...shortCourse,
//             ...courseInfo.courseDetails,
//             section: {
//               ...courseInfo.section,
//               color: shortCourse.color,
//             },
//           });
//         }
//       }
//       schedules.push({
//         ...shortCourseSchedule,
//         courses,
//       });
//     }
//     set({ schedules });
//   } catch (e) {
//     this.revertState();
//     throw new Error('Unable to load schedule');
//   }
// },
