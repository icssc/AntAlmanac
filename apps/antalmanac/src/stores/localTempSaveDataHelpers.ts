import { changeCurrentSchedule } from '$actions/AppStoreActions';
import {
    getLocalStorageTempSaveData,
    removeLocalStorageTempSaveData,
    setLocalStorageTempSaveData,
} from '$lib/localStorage';

/**
 * Any values stored in temporarily saved data should eventually be permanently saved.
 */
interface TempSaveData {
    currentScheduleIndex?: number;
    skeletonBlueprint?: Array<{
        dayOffset: number;
        startHour: number;
        startMinute: number;
        endHour: number;
        endMinute: number;
    }>;
}

let dataToSave: TempSaveData = {};

/**
 * Loads temporary save data as override values.
 *
 * ```typescript
 *
 *   loadTempSaveData(savedSchedule.schedules.length);
 *
 * ```
 *
 * @param scheduleCount The number of schedules that the user has.
 */
export function loadTempSaveData(scheduleCount: number) {
    const savedDataString = getLocalStorageTempSaveData();
    if (savedDataString !== null) {
        const parsedData = JSON.parse(savedDataString) as TempSaveData;

        if (parsedData.currentScheduleIndex !== undefined) {
            if (parsedData.currentScheduleIndex >= scheduleCount) {
                parsedData.currentScheduleIndex = scheduleCount = 1;
            }
            changeCurrentSchedule(parsedData.currentScheduleIndex);
        }

        Object.assign(dataToSave, parsedData);
    }
}

/**
 * Stores a value as temporarily saved data.
 *
 * ```typescript
 *
 *   setTempSaveData({ currentSCheduleIndex: 0 });
 *
 * ```
 *
 * @param newData An object containing properties and values to override locally stored data with.
 * Does not need to contain all properties, any omitted properties will not be changed.
 */
export function setTempSaveData<T extends TempSaveData>(newData: T) {
    Object.assign(dataToSave, newData);
    setLocalStorageTempSaveData(JSON.stringify(dataToSave));
}

/**
 * Deletes any temporarily saved data.
 * This should be done whenever the temporarily saved data isn't needed anymore,
 * e.g. when autosave runs.
 *
 * ```typescript
 *
 *   deleteTempSaveData();
 *
 * ```
 *
 */
export function deleteTempSaveData() {
    removeLocalStorageTempSaveData();
    dataToSave = {};
}
