import { RepeatingCustomEvent } from "$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog";
import AppStore from "$stores/AppStore";
import trpc from "./api/trpc";

export interface ZotCourseResponse {
    codes: string[];
    customEvents: RepeatingCustomEvent[];
}
export async function queryZotCourse(schedule_name: string) {
    const response = await trpc.zotcourse.getUserData.mutate({ scheduleName: schedule_name });
    // For custom event, there is no course attribute in each.
    const codes = response.data
        .filter((section: { eventType: number }) => section.eventType === 3)
        .map((section: { course: { code: string } }) => section.course.code) as string[];
    const days = [false, false, false, false, false, false, false];
    const customEvents: RepeatingCustomEvent[] = response.data
        .filter((section: { eventType: number }) => section.eventType === 1)
        .map((event: { title: string; start: string; end: string; dow: number[] }) => {
            return {
                title: event.title,
                start: event.start,
                end: event.end,
                days: days.map((_, index) => event.dow.includes(index)),
                scheduleIndices: [AppStore.getCurrentScheduleIndex()],
                customEventID: Date.now(),
                color: '#551a8b',
            };
        }) as RepeatingCustomEvent[];
    return {
        codes: codes,
        customEvents: customEvents,
    };
}