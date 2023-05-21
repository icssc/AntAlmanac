import { type } from "arktype";
import { WebsocSection as WebsocSectionSchema } from "@packages/peterportal-schemas";

const AASectionExtendedProperties = type({
    color: "string"
})

export const AASectionSchema = type([WebsocSectionSchema, '&', AASectionExtendedProperties])
