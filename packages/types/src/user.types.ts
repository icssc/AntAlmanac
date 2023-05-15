import { ScheduleSaveStateSchema } from "./schedule.types";
import { type } from "arktype"

export const UserSchema = type({
    id: "string",
    userData: ScheduleSaveStateSchema
})

export type User = typeof UserSchema.infer
