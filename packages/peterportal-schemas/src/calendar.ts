import { type Infer, type } from "arktype";
import type { Quarter } from "peterportal-api-next-types";

export const WeekData = type({
  week: "string",
  quarter: "string" as Infer<`${string} ${Quarter}`>,
  display: "string",
});

export const QuarterDates = type({
  instructionStart: "Date",
  instructionEnd: "Date",
  finalsStart: "Date",
  finalsEnd: "Date",
});
