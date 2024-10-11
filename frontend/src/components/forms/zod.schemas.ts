import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "Full name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Email is invalid" }),
    username: z.string().min(1, { message: "Username is required" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // Specify which field this error is for
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password is required" }),
});

const imageFileSchema = z
  .union([z.instanceof(File), z.null()])
  .refine((file) => file === null || file.type.startsWith("image/"), {
    message: "Must be an image file",
  });

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Content is required" })
    .max(500, { message: "Content is limited to 500 characters" }),

  // image: imageFileSchema,
  image: z.string().nullable().optional(),
});
