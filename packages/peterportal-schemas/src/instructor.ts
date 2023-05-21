import { arrayOf, type } from "arktype";

/**
 * An object representing an instructor.
 * The type of the payload returned on a successful response from querying
 * ``/v1/rest/instructors/{ucinetid}``.
 * @alpha
 */
export const Instructor = type({
  ucinetid: "string",
  instructorName: "string",
  shortenedName: "string",
  title: "string",
  department: "string",
  schools: "string[]",
  relatedDepartments: "string[]",
  courseHistory: "string[]",
});

export const Instructors = arrayOf(Instructor);
