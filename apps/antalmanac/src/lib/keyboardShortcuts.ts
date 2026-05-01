/**
 * Single source of truth for keyboard shortcuts shown in the shortcuts modal.
 * Add new entries here when introducing new shortcuts so they stay documented.
 */
export type ShortcutKey = { type: 'key'; label: string } | { type: 'mod'; mac: string; other: string };

export interface ShortcutItem {
    /** Short label for the key combo (e.g. "⌘ Z") — used for aria; built from keys on render */
    id: string;
    description: string;
    keys: ShortcutKey[];
}

export type ShortcutSectionIcon = 'general' | 'search' | 'dialogs';

export interface ShortcutSection {
    title: string;
    icon: ShortcutSectionIcon;
    items: ShortcutItem[];
}

function mod(): ShortcutKey {
    return { type: 'mod', mac: '⌘', other: 'Ctrl' };
}

function key(label: string): ShortcutKey {
    return { type: 'key', label };
}

/**
 * All shortcuts we currently support in the app.
 * Keep in sync with actual handlers (App.tsx, CoursePaneRoot, CalendarCourseEventWrapper, etc.).
 */
export const KEYBOARD_SHORTCUT_SECTIONS: ShortcutSection[] = [
    {
        title: 'General',
        icon: 'general',
        items: [
            {
                id: 'undo',
                description: 'Undo last change',
                keys: [mod(), key('Z')],
            },
            {
                id: 'redo',
                description: 'Redo',
                keys: [mod(), key('Shift'), key('Z')],
            },
            {
                id: 'shortcuts-help',
                description: 'Open keyboard shortcuts',
                keys: [mod(), key('/')],
            },
        ],
    },
    {
        title: 'Search & calendar',
        icon: 'search',
        items: [
            {
                id: 'escape-search',
                description: 'Return to search form (when viewing results)',
                keys: [key('Esc')],
            },
            {
                id: 'escape-popover',
                description: 'Close course/event popover',
                keys: [key('Esc')],
            },
            {
                id: 'cmd-click-course',
                description: 'Open course in search (click course on calendar)',
                keys: [mod(), key('Click')],
            },
        ],
    },
    {
        title: 'Dialogs',
        icon: 'dialogs',
        items: [
            {
                id: 'dialog-enter',
                description: 'Confirm (in add/rename schedule dialogs)',
                keys: [key('Enter')],
            },
            {
                id: 'dialog-escape',
                description: 'Cancel / close dialog',
                keys: [key('Esc')],
            },
        ],
    },
];

export function isMacPlatform(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPhone|iPod|iPad/i.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent);
}

/**
 * Flat list of shortcut keys as display strings for one platform.
 */
export function formatShortcutKeys(keys: ShortcutKey[], mac: boolean): string[] {
    const out: string[] = [];
    for (const k of keys) {
        if (k.type === 'mod') out.push(mac ? k.mac : k.other);
        else if (k.type === 'key') out.push(k.label);
    }
    return out;
}
