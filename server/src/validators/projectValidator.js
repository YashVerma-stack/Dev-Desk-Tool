
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must contain at least 3 characters")
    .max(150, "Project name cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .default(""),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must contain at least 3 characters")
    .max(150, "Project name cannot exceed 150 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required",
  }
);
