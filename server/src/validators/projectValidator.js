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

  memberIds: z
    .array(
      z
        .number()
        .int("Member ID must be an integer")
        .positive("Member ID must be positive")
    )
    .min(1, "At least one project member is required")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate member IDs are not allowed"
    ),
});

export const assignProjectMembersSchema = z.object({
  memberIds: z
    .array(
      z
        .number()
        .int("Member ID must be an integer")
        .positive("Member ID must be positive")
    )
    .min(1, "At least one member ID is required")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate member IDs are not allowed"
    ),
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
