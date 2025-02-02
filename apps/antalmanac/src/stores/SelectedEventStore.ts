import { SyntheticEvent } from 'react';
import { create } from 'zustand';

import { CalendarEventProps } from '$components/Calendar/CalendarEventPopoverContent';

export interface SelectedEventStore {
    selectedEvent: CalendarEventProps | null;
    selectedEventAnchorEl: Element | null;
    setSelectedEvent: (anchorEl: SyntheticEvent | null, selectedEvent: CalendarEventProps | null) => void;
}

export const useSelectedEventStore = create<SelectedEventStore>((set) => {
    return {
        selectedEvent: null,
        selectedEventAnchorEl: null,
        setSelectedEvent: (anchorEl: SyntheticEvent | null, selectedEvent: CalendarEventProps | null) => {
            set({
                selectedEvent: selectedEvent,
                selectedEventAnchorEl: anchorEl?.currentTarget,
            });
        },
    };
});
