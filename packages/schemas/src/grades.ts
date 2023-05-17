import { arrayOf, type } from "arktype";

import { quarters } from "../types/constants";
import enumerate from "./enumerate";

/**
 * A section which has grades data associated with it.
 */
export const GradeSection = type({
  year: "string",
  quarter: enumerate(quarters),
  department: "string",
  courseNumber: "string",
  courseNumeric: "number",
  sectionCode: "string",
  instructors: "string[]",
});

export const GradeDistribution = type({
  gradeACount: "number",
  gradeBCount: "number",
  gradeCCount: "number",
  gradeDCount: "number",
  gradeFCount: "number",
  gradePCount: "number",
  gradeNPCount: "number",
  gradeWCount: "number",
  averageGPA: "number",
});

/**
 * The type of the payload returned on a successful response from querying
 * ``/v1/rest/grades/raw``.
 * @alpha
 */
export const GradesRaw = arrayOf(type([GradeSection, "&", GradeDistribution]));

/**
 * An object that represents aggregate grades statistics for a given query.
 * The type of the payload returned on a successful response from querying
 * ``/v1/rest/grades/aggregate``.
 * @alpha
 */
export const GradesAggregate = type({
  sectionList: arrayOf(GradeSection),
  gradeDistribution: GradeDistribution,
});
