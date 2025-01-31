import { create } from 'zustand';
import type { UndoAction } from '$actions/ActionTypesStore';
import actionTypesStore from '$actions/ActionTypesStore';
import { useScheduleStore } from '$stores/ScheduleStore';

interface UndoRedoStore {
    undoAction: () => void;
}

export const useUndoRedoStore = create<UndoRedoStore>(() => ({
    undoAction: () => {
        const scheduleStore = useScheduleStore.getState();
        scheduleStore.schedule.revertState();
        useScheduleStore.setState({ unsavedChanges: true });
        const action: UndoAction = { 
            type: 'undoAction' 
        };
        actionTypesStore.autoSaveSchedule(action);
    },
}));