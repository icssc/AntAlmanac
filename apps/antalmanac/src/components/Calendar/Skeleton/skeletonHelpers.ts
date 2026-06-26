import {
    skeletonBlueprintVariations,
    type SkeletonBlueprint,
} from '$components/Calendar/Skeleton/skeletonBlueprintVariations';
import type { SkeletonEvent } from '$components/Calendar/types';

export const CALENDAR_BASE_DATE = new Date(2018, 0, 1);

function blueprintToSkeletonEvent(blueprint: SkeletonBlueprint, color: string): SkeletonEvent {
    const start = new Date(CALENDAR_BASE_DATE);
    start.setDate(start.getDate() + blueprint.dayOffset);
    start.setHours(blueprint.startHour, blueprint.startMinute, 0, 0);

    const end = new Date(start);
    end.setHours(blueprint.endHour, blueprint.endMinute, 0, 0);

    return {
        color,
        start,
        end,
        title: '',
        eventKind: 'skeleton',
    };
}

/**
 * Build deterministic skeleton events from a blueprint array or the default
 * variation. The result must be identical on server and client so SSR
 * hydration never encounters a text-node mismatch (React #418).
 */
export function createSkeletonEvents(color: string, blueprints?: SkeletonBlueprint[] | null): SkeletonEvent[] {
    const chosen = blueprints ?? skeletonBlueprintVariations[0];
    return chosen.map((blueprint) => blueprintToSkeletonEvent(blueprint, color));
}
