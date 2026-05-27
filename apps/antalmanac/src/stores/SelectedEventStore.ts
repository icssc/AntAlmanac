import type { CalendarEvent } from '$components/Calendar/CourseCalendarEvent';
import type { ScheduleViewScope } from '$lib/schedule/ScheduleViewSource';
import { SyntheticEvent } from 'react';
import { create } from 'zustand';

interface SelectedEventStore {
    selectedEvent: CalendarEvent | null;
    selectedEventAnchorEl: Element | null;
    selectedEventScope: ScheduleViewScope | null;
    setSelectedEvent: (
        anchorEl: SyntheticEvent | null,
        selectedEvent: CalendarEvent | null,
        scope?: ScheduleViewScope | null
    ) => void;
}

export const useSelectedEventStore = create<SelectedEventStore>((set) => {
    return {
        selectedEvent: null,
        selectedEventAnchorEl: null,
        selectedEventScope: null,
        setSelectedEvent: (
            anchorEl: SyntheticEvent | null,
            selectedEvent: CalendarEvent | null,
            scope: ScheduleViewScope | null = null
        ) => {
            set({
                selectedEvent: selectedEvent,
                selectedEventAnchorEl: anchorEl?.currentTarget,
                selectedEventScope: selectedEvent ? scope : null,
            });
        },
    };
});
