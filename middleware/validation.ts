import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  propertyInterest: z.string().min(2),
  budget: z.number().positive(),
  status: z
    .enum([
      "new",
      "contacted",
      "qualified",
      "closed",
      "lost",
      "done",
      "client_interested",
      "not_interested",
      "pending",
      "did_not_contact"
    ])
    .optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  followUpDate: z.union([z.string().datetime(), z.literal(""), z.null()]).optional()
});

export const leadUpdateSchema = leadSchema.partial();
