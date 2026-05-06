import PatchNotes, { closeButtonTestId, dialogTestId, backdropTestId } from '$components/PatchNotes';
import {
    getLocalStoragePatchNotesKey,
    setLocalStoragePatchNotesKey,
    setLocalStorageTourHasRun,
} from '$lib/localStorage';
import { LATEST_PATCH_NOTES_UPDATE, shouldShowPatchNotes, usePatchNotesStore } from '$stores/PatchNotesStore';
import { render, screen, act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

describe('patch notes', () => {
    /**
     * A date that's guaranteed to be outdated.
     */
    const outdatedPatchNotes = '00000000';

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('patch notes displays appropriately', () => {
        test('displays when latest patch notes is outdated ', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-02-15T12:00:00.000Z'));

            setLocalStoragePatchNotesKey(outdatedPatchNotes);
            setLocalStorageTourHasRun('true');
            usePatchNotesStore.setState({ showPatchNotes: shouldShowPatchNotes() });

            render(<PatchNotes />);

            expect(screen.queryByTestId(dialogTestId)).toBeTruthy();
        });

        test('no display when latest patch notes is up to date', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-02-15T12:00:00.000Z'));

            setLocalStoragePatchNotesKey(LATEST_PATCH_NOTES_UPDATE);
            usePatchNotesStore.setState({ showPatchNotes: shouldShowPatchNotes() });

            render(<PatchNotes />);

            expect(screen.queryByTestId(dialogTestId)).toBeFalsy();
        });

        test('no auto display when patch notes are older than 30 calendar days', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-03-02T12:00:00.000Z'));

            setLocalStoragePatchNotesKey(outdatedPatchNotes);
            setLocalStorageTourHasRun('true');
            usePatchNotesStore.setState({ showPatchNotes: shouldShowPatchNotes() });

            render(<PatchNotes />);

            expect(screen.queryByTestId(dialogTestId)).toBeFalsy();
        });

        test('auto display still allowed on the 30th calendar day after release', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));

            setLocalStoragePatchNotesKey(outdatedPatchNotes);
            setLocalStorageTourHasRun('true');
            usePatchNotesStore.setState({ showPatchNotes: shouldShowPatchNotes() });

            render(<PatchNotes />);

            expect(screen.queryByTestId(dialogTestId)).toBeTruthy();
        });
    });

    describe('close patch notes with button', () => {
        test('clicking the button closes the dialog', async () => {
            usePatchNotesStore.setState({ showPatchNotes: true });

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(closeButtonTestId).click();
            });

            await waitFor(() => {
                expect(screen.queryByTestId(dialogTestId)).toBeNull();
            });
        });

        test('the latest patch notes is saved to local storage', () => {
            setLocalStoragePatchNotesKey(outdatedPatchNotes);
            usePatchNotesStore.setState({ showPatchNotes: true });

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(closeButtonTestId).click();
            });

            expect(getLocalStoragePatchNotesKey()).toEqual(LATEST_PATCH_NOTES_UPDATE);
        });
    });

    describe('closing the dialog by clicking the backdrop ', () => {
        test('clicking the backdrop closes the dialog', async () => {
            usePatchNotesStore.setState({ showPatchNotes: true });

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(backdropTestId).click();
            });

            await waitFor(() => {
                expect(screen.queryByTestId(dialogTestId)).toBeNull();
            });
        });

        test('the latest patch notes is saved to local storage', () => {
            setLocalStoragePatchNotesKey(outdatedPatchNotes);
            usePatchNotesStore.setState({ showPatchNotes: true });

            render(<PatchNotes />);

            act(() => {
                screen.getByTestId(backdropTestId).click();
            });

            expect(getLocalStoragePatchNotesKey()).toEqual(LATEST_PATCH_NOTES_UPDATE);
        });
    });
});
