import { shouldIgnoreShortcutTarget } from '$lib/keyboardShortcuts';
import { useCallback, useEffect, useState } from 'react';

/** Opens the keyboard shortcuts modal on Cmd+/ (Mac) or Ctrl+/ (Windows/Linux). */
function isSlashChord(event: KeyboardEvent): boolean {
    if (!event.metaKey && !event.ctrlKey) {
        return false;
    }
    return event.code === 'Slash' || event.key === '/' || event.key === '?';
}

export function useKeyboardShortcutsModal() {
    const [open, setOpen] = useState(false);

    const openModal = useCallback(() => setOpen(true), []);
    const closeModal = useCallback(() => setOpen(false), []);
    const toggleModal = useCallback(() => setOpen((prev) => !prev), []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (isSlashChord(event)) {
                if (shouldIgnoreShortcutTarget(event.target)) return;
                event.preventDefault();
                event.stopPropagation();
                toggleModal();
                return;
            }
            // Escape closes when modal is open — handled inside modal too, but global
            // ensures we close even if focus is weird
            if (event.key === 'Escape' && open) {
                event.preventDefault();
                closeModal();
            }
        };

        document.addEventListener('keydown', onKeyDown, true);
        return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [open, toggleModal, closeModal]);

    return { open, openModal, closeModal };
}
