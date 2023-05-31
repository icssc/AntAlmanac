import { ScheduleSaveStateSchema } from "./schedule";
import { type } from "arktype";

export const UserSchema = type({
  id: "string",
  userData: ScheduleSaveStateSchema,
});
export type User = typeof UserSchema.infer;

export const AuthUserSchema = type({
  id: "string",
  "userData?": ScheduleSaveStateSchema,
  name: "string",
  email: "string",
  picture: "string",
});
export type AuthUser = typeof AuthUserSchema.infer;
