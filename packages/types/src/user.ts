import { ScheduleSaveStateSchema } from "./schedule";
import { type } from "arktype"

export const UserSchema = type({
    id: "string",
    userData: ScheduleSaveStateSchema
})

export type User = typeof UserSchema.infer
