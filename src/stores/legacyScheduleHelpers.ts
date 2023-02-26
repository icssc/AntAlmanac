import { ScheduleSaveState } from './schedule.types';

interface LegacyShortCourseInfo {
    color: string;
    term: string;
    sectionCode: string;
    scheduleIndices: number[];
}

export interface LegacyRepeatingCustomEvent {
    title: string;
    start: string;
    end: string;
    days: boolean[];
    customEventID: number;
    color?: string;
    scheduleIndices: number[];
}

export interface LegacyUserData {
    addedCourses: LegacyShortCourseInfo[];
    scheduleNames: string[];
    customEvents: LegacyRepeatingCustomEvent[];
}

export function convertLegacySchedule(legacyUserData: LegacyUserData) {
    const scheduleSaveState: ScheduleSaveState = { schedules: [], scheduleIndex: 0 };
    for (const scheduleName of legacyUserData.scheduleNames) {
        scheduleSaveState.schedules.push({
            scheduleName: scheduleName,
            courses: [],
            customEvents: [],
            scheduleNote: '',
        });
    }
    for (const course of legacyUserData.addedCourses) {
        for (const scheduleIndex of course.scheduleIndices) {
            scheduleSaveState.schedules[scheduleIndex].courses.push({ ...course });
        }
    }
    for (const customEvent of legacyUserData.customEvents) {
        for (const scheduleIndex of customEvent.scheduleIndices) {
            scheduleSaveState.schedules[scheduleIndex].customEvents.push({ ...customEvent });
        }
    }
    return scheduleSaveState;
}
