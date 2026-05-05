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
  status: z.enum(["new", "contacted", "qualified", "closed", "lost"]).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  followUpDate: z.string().datetime().optional()
});

export const leadUpdateSchema = leadSchema.partial();
