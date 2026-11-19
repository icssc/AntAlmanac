import { CalendarEventDetail } from '$components/Calendar/CalendarEvent/CalendarEventDetail';
import { CalendarEventPopover } from '$components/Calendar/CalendarEvent/CalendarEventPopover';
import AppStore from '$stores/AppStore';
import { calendarizeCustomEvents } from '$stores/calendarizeHelpers';
import { useSelectedEventStore } from '$stores/SelectedEventStore';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

function addCustomEvent(customEventID: string, title: string, building?: string) {
    const customEvent: RepeatingCustomEvent = {
        customEventID,
        title,
        start: '10:30',
        end: '15:30',
        days: [false, true, false, false, false, false, false],
        color: '#551a8b',
        building,
    };
    AppStore.addCustomEvent(customEvent, [AppStore.getCurrentScheduleIndex()]);
    return { customEvent, selectedEvent: calendarizeCustomEvents([customEvent])[0] };
}

describe('CalendarEventDetail for custom events', () => {
    test('shows the new title after the event is edited while the popover is open', () => {
        const { customEvent, selectedEvent } = addCustomEvent('popover-edit', 'Old title');
        render(<CalendarEventDetail selectedEvent={selectedEvent} closePopover={vi.fn()} />);
        expect(screen.getByText('Old title')).toBeTruthy();

        act(() => {
            AppStore.editCustomEvent({ ...customEvent, title: 'New title' }, [AppStore.getCurrentScheduleIndex()]);
        });

        expect(screen.getByText('New title')).toBeTruthy();
        expect(screen.queryByText('Old title')).toBeNull();
    });

    test('shows the new location after the event is edited while the popover is open', () => {
        const { customEvent, selectedEvent } = addCustomEvent('popover-location', 'Studio time', '83021');
        render(<CalendarEventDetail selectedEvent={selectedEvent} closePopover={vi.fn()} />);
        expect(screen.getByText('Art Studio (ART)')).toBeTruthy();

        act(() => {
            AppStore.editCustomEvent({ ...customEvent, building: '83022' }, [AppStore.getCurrentScheduleIndex()]);
        });

        expect(screen.getByText('Art Culture & Technology (ACT)')).toBeTruthy();
        expect(screen.queryByText('Art Studio (ART)')).toBeNull();
    });

    test('shows the schedules the event is in', () => {
        const { selectedEvent } = addCustomEvent('popover-schedules', 'Club meeting');
        render(<CalendarEventDetail selectedEvent={selectedEvent} closePopover={vi.fn()} />);

        const currentScheduleName = AppStore.getScheduleNames()[AppStore.getCurrentScheduleIndex()];
        expect(screen.getByText('Schedule')).toBeTruthy();
        expect(screen.getByText(currentScheduleName)).toBeTruthy();
    });

    test('closes the popover when the event is removed from the current schedule', () => {
        const { selectedEvent } = addCustomEvent('popover-delete', 'To delete');
        const closePopover = vi.fn();
        render(<CalendarEventDetail selectedEvent={selectedEvent} closePopover={closePopover} />);

        act(() => {
            AppStore.deleteCustomEvent('popover-delete', [AppStore.getCurrentScheduleIndex()]);
        });

        expect(closePopover).toHaveBeenCalled();
    });

    test('closes the popover when the clicked day is unselected', () => {
        const { customEvent, selectedEvent } = addCustomEvent('popover-day', 'Mon and Tue');
        const closePopover = vi.fn();
        render(<CalendarEventDetail selectedEvent={selectedEvent} closePopover={closePopover} />);

        act(() => {
            AppStore.editCustomEvent({ ...customEvent, days: [false, true, true, false, false, false, false] }, [
                AppStore.getCurrentScheduleIndex(),
            ]);
        });
        expect(closePopover).not.toHaveBeenCalled();

        act(() => {
            AppStore.editCustomEvent({ ...customEvent, days: [false, false, true, false, false, false, false] }, [
                AppStore.getCurrentScheduleIndex(),
            ]);
        });
        expect(closePopover).toHaveBeenCalled();
    });
});

describe('CalendarEventPopover', () => {
    test('closes when the clicked tile is no longer on the page', () => {
        const { selectedEvent } = addCustomEvent('popover-anchor', 'Weekend switch');
        useSelectedEventStore.setState({ selectedEvent, selectedEventAnchorEl: document.createElement('div') });

        render(<CalendarEventPopover />);

        expect(useSelectedEventStore.getState().selectedEvent).toBeNull();
    });
});
