import { z } from "zod";

// Update user validation
export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email")
      .transform((email) => email.toLowerCase())
      .optional(),

    role: z
      .enum(["admin", "member"], {
        message: "Role must be either admin or member",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for updating a user",
  });