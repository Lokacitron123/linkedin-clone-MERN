import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1, "Content is required"),
  image: z.string().optional(),
});

export const createPostCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
});
