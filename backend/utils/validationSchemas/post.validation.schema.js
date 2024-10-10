import { z } from "zod";

export const imageFileSchema = z
  .union([z.instanceof(File), z.null()])
  .refine((file) => file === null || file.type.startsWith("image/"), {
    message: "Must be an image file",
  });

export const createPostSchema = z.object({
  content: z.string().min(1, "Content is required"),
  // image: imageFileSchema,
});

export const createPostCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
});
