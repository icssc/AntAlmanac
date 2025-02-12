import { create } from 'zustand';

// Adapted from https://stackoverflow.com/questions/51503754/typescript-type-beforeinstallpromptevent
type UserChoice = Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
}>;

export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: UserChoice;
    prompt(): Promise<UserChoice>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export interface PWAStore {
    canInstall: boolean;
    installPrompt: BeforeInstallPromptEvent | null;
    setInstallPrompt: (e: BeforeInstallPromptEvent) => void;
    setCanInstall: (canInstall: boolean) => void;
}

export const usePWAStore = create<PWAStore>((set) => {
    return {
        canInstall: false,
        installPrompt: null,
        setInstallPrompt: (e: BeforeInstallPromptEvent) => {
            set({
                installPrompt: e,
            });
        },
        setCanInstall: (canInstall: boolean) => {
            set({
                canInstall,
            });
        },
    };
});
