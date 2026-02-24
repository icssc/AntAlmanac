import type { CourseEvent } from "$components/Calendar/CourseCalendarEvent";
import { defaultTerm, getDefaultTerm, termData } from "$lib/termData";
import { describe, expect, test } from "vitest";

describe("termData", () => {
    /**
     * Leaky/abstracted test because it knows how the function actually works.
     */
    test("uses default term index if no events is provided", () => {
        const term = getDefaultTerm();
        expect(term.shortName).toEqual(termData[defaultTerm]);
    });

    test("uses first term found in event list if provided", () => {
        const event: CourseEvent = {
            locations: [],
            showLocationInfo: false,
            finalExam: {
                examStatus: "NO_FINAL",
            },
            courseTitle: "",
            instructors: [],
            isCustomEvent: false,
            sectionCode: "",
            sectionType: "",
            term: "",
            color: "",
            deptValue: "",
            courseNumber: "",
            start: new Date(0),
            end: new Date(0),
            title: "",
        };

        const term = getDefaultTerm([event]);

        expect(term.shortName).toEqual(event.term);
    });
});
