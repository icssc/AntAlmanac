import { describe, expect, test } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PatchNotes, {
    latestPatchNotesUpdate,
    patchNotesKey,
    closeButtonTestId,
    dialogTestId,
    backdropTestId,
} from '$components/PatchNotes';

describe('patch notes', () => {
    describe('patch notes displays appropriately', () => {
        test('displays when latest patch notes is outdated ', () => {
            localStorage.setItem(patchNotesKey, '00000000');

            render(<PatchNotes />);

            expect(screen.queryByTestId(dialogTestId)).toBeTruthy();
        });

        test('no display when latest patch notes is up to date', () => {
            localStorage.setItem(patchNotesKey, latestPatchNotesUpdate);

            render(<PatchNotes />);

            expect(screen.queryByTestId(dialogTestId)).toBeFalsy();
        });
    });

    describe('close patch notes with button', () => {
        test('clicking the button closes the dialog', () => {
            localStorage.setItem(patchNotesKey, '00000000');

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(closeButtonTestId).click();
            });

            expect(screen.queryByTitle(dialogTestId)).toBeFalsy();
        });

        test('the latest patch notes is saved to local storage', () => {
            localStorage.setItem(patchNotesKey, '00000000');

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(closeButtonTestId).click();
            });

            expect(localStorage.getItem(patchNotesKey)).toEqual(latestPatchNotesUpdate);
        });
    });

    describe('closing the dialog by clicking the backdrop ', () => {
        test('clicking the backdrop closes the dialog', () => {
            localStorage.setItem(patchNotesKey, '00000000');

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(backdropTestId).click();
            });

            const dialog = screen.queryByTitle(dialogTestId);

            expect(dialog).toBeFalsy();
        });

        test('the latest patch notes is saved to local storage', () => {
            localStorage.setItem(patchNotesKey, '00000000');

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(backdropTestId).click();
            });

            expect(localStorage.getItem(patchNotesKey)).toEqual(latestPatchNotesUpdate);
        });
    });
});
