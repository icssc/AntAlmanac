import {morph, type} from "arktype";

export const RepeatingCustomEventSchema = type({
    title: "string",
    start: "string",
    end: "string",
    days: "boolean[]",
    customEventID: morph("string", (s) => parseInt(s)),
    "color?": "string",
});
