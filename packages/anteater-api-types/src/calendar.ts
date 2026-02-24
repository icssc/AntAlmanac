import { paths } from "./generated/anteater-api-types";

export type CalendarTerm =
    paths["/v2/rest/calendar"]["get"]["responses"][200]["content"]["application/json"]["data"];
