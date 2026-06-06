import type { CalendarEvent } from '$components/Calendar/types';
import { SyntheticEvent } from 'react';
import { create } from 'zustand';

interface SelectedEventStore {
    selectedEvent: CalendarEvent | null;
    selectedEventAnchorEl: Element | null;
    setSelectedEvent: (anchorEl: SyntheticEvent | null, selectedEvent: CalendarEvent | null) => void;
}

export const useSelectedEventStore = create<SelectedEventStore>((set) => {
    return {
        selectedEvent: null,
        selectedEventAnchorEl: null,
        setSelectedEvent: (anchorEl: SyntheticEvent | null, selectedEvent: CalendarEvent | null) => {
            set({
                selectedEvent: selectedEvent,
                selectedEventAnchorEl: anchorEl?.currentTarget,
            });
        },
    };
});
