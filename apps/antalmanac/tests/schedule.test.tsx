import RenameScheduleDialog from "$components/dialogs/RenameSchedule";
import { Schedules } from "$stores/Schedules";
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("schedule logic", () => {
    const scheduleStore = new Schedules();

    test("no error when loading undefined schedule", () => {
        expect(() => scheduleStore.getScheduleName(100)).not.toThrowError();
    });

    test("does not error if schedule name is undefined", () => {
        expect(() => render(<RenameScheduleDialog index={100} open />)).not.toThrowError();
    });
});
