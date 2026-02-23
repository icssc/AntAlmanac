import { paths } from "./generated/anteater-api-types";

export type GE = NonNullable<
    NonNullable<paths["/v2/rest/grades/raw"]["get"]["parameters"]["query"]>["ge"]
>;

export type AggregateGrades =
    paths["/v2/rest/grades/aggregate"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type AggregateGradesByOffering =
    paths["/v2/rest/grades/aggregateByOffering"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
