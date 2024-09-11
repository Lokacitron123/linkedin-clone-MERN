import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"), // E.g john123, Alice, User007
  email: z.string().email("Email is not valid"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
