import AppStore from '$stores/AppStore';
import { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { createId } from '@paralleldrive/cuid2';

export interface ZotcourseResponse {
    codes: string[];
    customEvents: RepeatingCustomEvent[];
}

type ZotcourseSection =
    | { eventType: 3; course: { code: string } }
    | { eventType: 1; title: string; start: string; end: string; dow: number[] }
    | { eventType: number };

export function processZotcourseResponse(data: ZotcourseSection[]): ZotcourseResponse {
    const days = [false, false, false, false, false, false, false];

    const codes = data
        .filter((section): section is { eventType: 3; course: { code: string } } => section.eventType === 3)
        .map((section) => section.course.code);

    const customEvents: RepeatingCustomEvent[] = data
        .filter(
            (section): section is { eventType: 1; title: string; start: string; end: string; dow: number[] } =>
                section.eventType === 1
        )
        .map((event) => ({
            title: event.title,
            start: event.start,
            end: event.end,
            days: days.map((_, index) => event.dow.includes(index)),
            scheduleIndices: [AppStore.getCurrentScheduleIndex()],
            customEventID: createId(),
            color: '#551a8b',
        }));

    return { codes, customEvents };
}
