
import { z } from "zod";

// ==========================================
// ALLOWED ISSUE STATUS VALUES
// ==========================================

const issueStatus = z.enum([
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

// ==========================================
// ALLOWED ISSUE PRIORITY VALUES
// ==========================================

const issuePriority = z.enum([
  "critical",
  "high",
  "medium",
  "low",
]);

// ==========================================
// CREATE ISSUE VALIDATION
// ==========================================

export const createIssueSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must contain at least 3 characters")
      .max(200, "Title must not exceed 200 characters"),

    description: z
      .string()
      .trim()
      .max(5000, "Description must not exceed 5000 characters")
      .nullable()
      .optional(),

    priority: issuePriority.optional().default("medium"),

    projectId: z
      .number()
      .int()
      .positive("Project ID must be a positive integer"),

    assignedTo: z
      .number()
      .int()
      .positive("Assigned user ID must be a positive integer")
      .nullable()
      .optional(),
  })
  .strict();

// ==========================================
// UPDATE ISSUE VALIDATION
// ==========================================

export const updateIssueSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must contain at least 3 characters")
      .max(200, "Title must not exceed 200 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000, "Description must not exceed 5000 characters")
      .nullable()
      .optional(),

    status: issueStatus.optional(),

    priority: issuePriority.optional(),

    assignedTo: z
      .number()
      .int()
      .positive("Assigned user ID must be a positive integer")
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
