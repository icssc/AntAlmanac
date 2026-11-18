import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import AppStore from '$stores/AppStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

function addEventWithNotes(notes: string) {
    const { unmount } = render(<CustomEventDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Add custom events' }));
    fireEvent.click(screen.getByRole('button', { name: 'M' }));
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: notes } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Event' }));
    unmount();

    return AppStore.schedule.getCurrentCustomEvents().at(-1);
}

describe('CustomEventDialog notes', () => {
    test('trims notes before saving', () => {
        expect(addEventWithNotes('  ROOM 100\n')?.notes).toBe('ROOM 100');
    });

    test('saves whitespace-only notes as undefined', () => {
        expect(addEventWithNotes(' \n ')?.notes).toBeUndefined();
    });
});
