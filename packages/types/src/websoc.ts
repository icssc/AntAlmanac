import { arrayOf, type } from "arktype";
import {
  WebsocSection as WebsocSectionSchema,
  WebsocCourse as WebsocCourseSchema,
} from "@packages/peterportal-schemas";

const AASectionExtendedProperties = type({
  color: "string",
});

export const AASectionSchema = type([
  WebsocSectionSchema,
  "&",
  AASectionExtendedProperties,
]);
export type AASection = typeof AASectionSchema.infer;

const AACourseExtendedProperties = type({
  sections: arrayOf(AASectionSchema),
});

export const AACourseSchema = type([
  WebsocCourseSchema,
  "&",
  AACourseExtendedProperties,
]);
export type AACourse = typeof AACourseSchema.infer;
