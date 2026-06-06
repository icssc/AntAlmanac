import {
    skeletonBlueprintVariations,
    type SkeletonBlueprint,
} from '$components/Calendar/Skeleton/skeletonBlueprintVariations';
import { CalendarEventKind, type SkeletonEvent } from '$components/Calendar/types';
import { getLocalStorageSkeletonBlueprint } from '$lib/localStorage';

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
        eventKind: CalendarEventKind.Skeleton,
    };
}

export function createSkeletonEvents(color: string): SkeletonEvent[] {
    const savedDataString = getLocalStorageSkeletonBlueprint();

    let skeletonBlueprints: SkeletonBlueprint[] | null = null;

    if (savedDataString) {
        const parsedData = JSON.parse(savedDataString);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
            skeletonBlueprints = parsedData;
        }
    }

    if (skeletonBlueprints) {
        return skeletonBlueprints.map((blueprint) => blueprintToSkeletonEvent(blueprint, color));
    }

    const randomIndex = Math.floor(Math.random() * skeletonBlueprintVariations.length);
    const fallbackBlueprints = skeletonBlueprintVariations[randomIndex];

    return fallbackBlueprints.map((blueprint) => blueprintToSkeletonEvent(blueprint, color));
}
