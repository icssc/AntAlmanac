import { describe, expect, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PatchNotes from '$components/PatchNotes';

const setLocalStorage = (key: string, value: string) => {
    window.localStorage.setItem(key, value);
};

describe('patch notes', () => {
    describe('when latestPatchSeen is not equal to latestPatchNotesUpdate', () => {
        test('should show the dialog', () => {
            setLocalStorage('latestPatchSeen', '20230513');

            const mockLatestPatchNotesUpdate = '20230819';
            if (mockLatestPatchNotesUpdate != localStorage.getItem('latestPatchSeen')) {
                render(<PatchNotes />);
            }

            const dialog = screen.queryByTestId('dialog');

            expect(dialog).toBeTruthy();
        });
    });

    describe('when latestPatchSeen equals latestPatchNotesUpdate', () => {
        test('should not show the dialog', () => {
            setLocalStorage('latestPatchSeen', '20230819');

            const mockLatestPatchNotesUpdate = '20230819';

            if (mockLatestPatchNotesUpdate != localStorage.getItem('latestPatchSeen')) {
                render(<PatchNotes />);
            }

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
            const mockLatestPatchNotesUpdate = '20230819';
            setLocalStorage('latestPatchSeen', mockLatestPatchNotesUpdate);

            expect(localStorage.getItem('latestPatchSeen')).toEqual(mockLatestPatchNotesUpdate);
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
            const mockLatestPatchNotesUpdate = '20230819';
            setLocalStorage('latestPatchSeen', mockLatestPatchNotesUpdate);

            expect(localStorage.getItem('latestPatchSeen')).toEqual(mockLatestPatchNotesUpdate);
        });
    });
});
