import { describe, expect, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PatchNotes, { latestPatchNotesUpdate } from '$components/PatchNotes';

const setLocalStorage = (key: string, value: string) => {
    window.localStorage.setItem(key, value);
};

describe('patch notes', () => {
    describe('when latestPatchSeen is not equal to latestPatchNotesUpdate', () => {
        test('should show the dialog', () => {
            localStorage.setItem('latestPatchSeen', '00000000');

            render(<PatchNotes />);

            const dialog = screen.queryByTestId('dialog');

            expect(dialog).toBeTruthy();
        });
    });

    describe('when latestPatchSeen equals latestPatchNotesUpdate', () => {
        test('should not show the dialog', () => {
            localStorage.setItem('latestPatchSeen', latestPatchNotesUpdate);

            render(<PatchNotes />);

            const dialog = screen.queryByTestId('dialog');

            expect(dialog).toBeFalsy();
        });
    });

    describe('when the close button is clicked', () => {
        test('should close the dialog', () => {
            render(<PatchNotes />);

            const closeButton = screen.queryByTestId('close button');
            if (closeButton) {
                fireEvent.click(closeButton);
            }

            const dialog = screen.queryByTitle('dialog');
            expect(dialog).toBeFalsy();
        });

        test('should save latestPatchNotesUpdate to localStorage as latestPatchSeen', () => {
            setLocalStorage('latestPatchSeen', latestPatchNotesUpdate);
            expect(localStorage.getItem('latestPatchSeen')).toEqual(latestPatchNotesUpdate);
        });
    });

    describe('when the backdrop is clicked', () => {
        test('should close the dialog', () => {
            render(<PatchNotes />);

            fireEvent.click(document.body);
            const dialog = screen.queryByTitle('dialog');

            expect(dialog).toBeFalsy();
        });

        test('should save latestPatchNotesUpdate to localStorage as latestPatchSeen', () => {
            setLocalStorage('latestPatchSeen', latestPatchNotesUpdate);
            expect(localStorage.getItem('latestPatchSeen')).toEqual(latestPatchNotesUpdate);
        });
    });
});
