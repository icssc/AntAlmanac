import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { postHog } from '$providers/PostHog';

export function logAddedClassesOpen() {
    logAnalytics(postHog, {
        category: analyticsEnum.addedClasses,
        action: analyticsEnum.addedClasses.actions.OPEN,
    });
}
