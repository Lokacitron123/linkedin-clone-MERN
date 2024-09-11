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

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"), // E.g john123, Alice, User007
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Zod validation schema for user profile updates
export const updateProfileSchema = z.object({
  name: z.string().optional(),
  headline: z.string().optional(),
  about: z.string().optional(),
  location: z.string().optional(),
  profilePicture: z.string().optional(),
  bannerImg: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z
    .array(
      z.object({
        title: z.string().optional(),
        company: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().optional(),
        degree: z.string().optional(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
      })
    )
    .optional(),
});
