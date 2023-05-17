import { type Infer, type } from "arktype";

import { Quarter } from "../types/constants";

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
