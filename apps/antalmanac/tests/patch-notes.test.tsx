import { render, screen, act } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import PatchNotes, { closeButtonTestId, dialogTestId, backdropTestId } from '$components/PatchNotes';
import { getLocalStoragePatchNotesKey, setLocalStoragePatchNotesKey } from '$lib/localStorage';
import { LATEST_PATCH_NOTES_UPDATE } from '$stores/HelpMenuStore';

describe('patch notes', () => {
    /**
     * A date that's guaranteed to be outdated.
     */
    const outdatedPatchNotes = '00000000';

    describe('patch notes displays appropriately', () => {
        test('displays when latest patch notes is outdated ', () => {
            setLocalStoragePatchNotesKey(outdatedPatchNotes);

            render(<PatchNotes />);

            expect(screen.queryByTestId(dialogTestId)).toBeTruthy();
        });

        test('no display when latest patch notes is up to date', () => {
            setLocalStoragePatchNotesKey(LATEST_PATCH_NOTES_UPDATE);

            render(<PatchNotes />);

            expect(screen.queryByTestId(dialogTestId)).toBeFalsy();
        });
    });

    describe('close patch notes with button', () => {
        test('clicking the button closes the dialog', () => {
            setLocalStoragePatchNotesKey(outdatedPatchNotes);

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(closeButtonTestId).click();
            });

            expect(screen.queryByTitle(dialogTestId)).toBeFalsy();
        });

        test('the latest patch notes is saved to local storage', () => {
            setLocalStoragePatchNotesKey(outdatedPatchNotes);

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(closeButtonTestId).click();
            });

            expect(getLocalStoragePatchNotesKey()).toEqual(LATEST_PATCH_NOTES_UPDATE);
        });
    });

    describe('closing the dialog by clicking the backdrop ', () => {
        test('clicking the backdrop closes the dialog', () => {
            setLocalStoragePatchNotesKey(outdatedPatchNotes);

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(backdropTestId).click();
            });

            const dialog = screen.queryByTitle(dialogTestId);

            expect(dialog).toBeFalsy();
        });

        test('the latest patch notes is saved to local storage', () => {
            setLocalStoragePatchNotesKey(outdatedPatchNotes);

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(backdropTestId).click();
            });

            expect(getLocalStoragePatchNotesKey()).toEqual(LATEST_PATCH_NOTES_UPDATE);
        });
    });
});
