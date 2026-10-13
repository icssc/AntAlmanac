import { useDevModeStore } from '$stores/SettingsStore';

export function initSchedulerClient() {
    useDevModeStore.getState().initDevMode();
}
