import { FilterQuery, Types } from "mongoose";
import { LeadModel, Lead } from "@/models/Lead";
import { calculateLeadScore } from "@/utils/lead-score";

export async function getLeadsForRole(userId: string, role: "admin" | "agent", filters?: Record<string, string>) {
  const query: FilterQuery<Lead> = {};
  if (role === "agent") query.assignedTo = new Types.ObjectId(userId);
  if (filters?.status) query.status = filters.status;
  if (filters?.priority) query.score = filters.priority;
  if (filters?.dateFrom || filters?.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }
  return LeadModel.find(query).populate("assignedTo", "name email role").sort({ createdAt: -1 });
}

export function buildLeadPayload(input: {
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  status?: string;
  notes?: string;
  assignedTo?: string;
  followUpDate?: string;
}) {
  return {
    ...input,
    score: calculateLeadScore(input.budget),
    assignedTo: input.assignedTo ? new Types.ObjectId(input.assignedTo) : undefined,
    followUpDate: input.followUpDate ? new Date(input.followUpDate) : undefined
  };
}
