import { EventEmitter } from 'events';
import { VariantType } from 'notistack';

import { CalendarEvent, CourseEvent } from '../components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '../components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calenderizeHelpers';
import { ScheduleCourse, ScheduleSaveState } from './schedule.types';
import { Schedules } from './Schedules';

class AppStore extends EventEmitter {
  schedule: Schedules;
  customEvents: RepeatingCustomEvent[];
  eventsInCalendar: CalendarEvent[];
  finalsEventsInCalendar: CourseEvent[];
  unsavedChanges: boolean;

  constructor() {
    super();
    this.setMaxListeners(300); //this number is big because every section on the search results page listens to two events each.
    this.customEvents = [];
    this.schedule = new Schedules();
    this.eventsInCalendar = [];
    this.finalsEventsInCalendar = [];
    this.unsavedChanges = false;
    window.addEventListener('beforeunload', (event) => {
      if (this.unsavedChanges) {
        event.returnValue = `Are you sure you want to leave? You have unsaved changes!`;
      }
    });
  }

  getCurrentScheduleIndex() {
    return this.schedule.getCurrentScheduleIndex();
  }

  getScheduleNames() {
    return this.schedule.getScheduleNames();
  }

  getAddedCourses() {
    return this.schedule.getAllCourses();
  }

  getCustomEvents() {
    return this.schedule.getAllCustomEvents();
  }

  addCourse(newCourse: ScheduleCourse, scheduleIndex: number = this.schedule.getCurrentScheduleIndex()) {
    if (scheduleIndex === this.schedule.getNumberOfSchedules()) {
      this.schedule.addCourseToAllSchedules(newCourse);
    } else {
      this.schedule.addCourse(newCourse);
    }
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
  }

  getEventsInCalendar() {
    return this.eventsInCalendar;
  }

  getFinalEventsInCalendar() {
    return this.finalsEventsInCalendar;
  }

  getAddedSectionCodes() {
    return this.schedule.getAddedSectionCodes();
  }

  hasUnsavedChanges() {
    return this.unsavedChanges;
  }

  deleteCourse(sectionCode: string, term: string) {
    this.schedule.deleteCourse(sectionCode, term);
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
  }

  undoAction() {
    this.schedule.revertState();
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
    this.emit('colorChange', false);
    this.emit('scheduleNamesChange');
    this.emit('currentScheduleIndexChange');
  }

  addCustomEvent(customEvent: RepeatingCustomEvent, scheduleIndices: number[]) {
    this.schedule.addCustomEvent(customEvent, scheduleIndices);
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('customEventsChange');
  }

  editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newScheduleIndices: number[]) {
    this.schedule.editCustomEvent(editedCustomEvent, newScheduleIndices);
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('customEventsChange');
  }

  deleteCustomEvent(customEventId: number) {
    this.schedule.deleteCustomEvent(customEventId);
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('customEventsChange');
  }

  addSchedule(newScheduleName: string) {
    // If the user adds a schedule, update the array of schedule names, add
    // another key/value pair to keep track of the section codes for that schedule,
    // and redirect the user to the new schedule
    this.schedule.addNewSchedule(newScheduleName);
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.emit('scheduleNamesChange');
    this.emit('currentScheduleIndexChange');
  }

  renameSchedule(scheduleName: string, scheduleIndex: number) {
    this.schedule.renameSchedule(scheduleName, scheduleIndex);
    this.emit('scheduleNamesChange');
  }

  saveSchedule() {
    this.unsavedChanges = false;
  }

  copySchedule(to: number) {
    this.schedule.copySchedule(to);
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
  }

  async loadSchedule(savedSchedule: ScheduleSaveState) {
    try {
      await this.schedule.fromScheduleSaveState(savedSchedule);
    } catch {
      return false;
    }
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = false;
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
    this.emit('scheduleNamesChange');
    this.emit('currentScheduleIndexChange');
    return true;
  }

  changeCurrentSchedule(newScheduleIndex: number) {
    this.schedule.setCurrentScheduleIndex(newScheduleIndex);
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.emit('currentScheduleIndexChange');
  }

  clearSchedule() {
    this.schedule.clearCurrentSchedule();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
  }

  deleteSchedule() {
    this.schedule.deleteCurrentSchedule();
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.emit('scheduleNamesChange');
    this.emit('currentScheduleIndexChange');
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
  }
}

const store = new AppStore();
export default store;
