import { type } from "arktype";

import { courseLevels, geCategories } from "../types/constants";
import enumerate from "./enumerate";

export const PrerequisiteTree = type({
  "AND?": "string[]",
  "OR?": "string[]",
});

/**
 * An object that represents a course.
 * The type of the payload returned on a successful response from querying
 * ``/v1/rest/courses/{courseId}``.
 * @alpha
 */
export const Course = type({
  id: "string",
  department: "string",
  courseNumber: "string",
  courseNumeric: "number",
  school: "string",
  title: "string",
  courseLevel: enumerate(courseLevels),
  minUnits: "string",
  maxUnits: "string",
  description: "string",
  departmentName: "string",
  instructorHistory: "string[]",
  prerequisiteTree: PrerequisiteTree,
  prerequisiteList: "string[]",
  prerequisiteText: "string",
  prerequisiteFor: "string[]",
  repeatability: "string",
  gradingOption: "string",
  concurrent: "string",
  sameAs: "string",
  restriction: "string",
  overlap: "string",
  corequisite: "string",
  geList: enumerate(geCategories),
  geText: "string",
  terms: "string[]",
});
