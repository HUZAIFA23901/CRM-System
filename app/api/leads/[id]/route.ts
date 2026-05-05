import { Types } from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { LeadModel } from "@/models/Lead";
import { leadUpdateSchema } from "@/middleware/validation";
import { createActivityLog } from "@/services/activity.service";
import { calculateLeadScore } from "@/utils/lead-score";
import { fail, ok } from "@/utils/api-response";
import { emitLeadEvent } from "@/utils/socket-events";

async function getLeadById(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  return LeadModel.findById(id);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || !token.role) return fail("Unauthorized", 401);
  await connectDb();
  const lead = await getLeadById(id);
  if (!lead) return fail("Lead not found", 404);
  if (token.role !== "admin" && String(lead.assignedTo) !== token.sub) return fail("Forbidden", 403);
  return ok(lead);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || !token.role) return fail("Unauthorized", 401);
  await connectDb();

  const lead = await getLeadById(id);
  if (!lead) return fail("Lead not found", 404);
  if (token.role !== "admin" && String(lead.assignedTo) !== token.sub) return fail("Forbidden", 403);

  const parsed = leadUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

  if (typeof parsed.data.budget === "number") lead.score = calculateLeadScore(parsed.data.budget);
  if (parsed.data.name) lead.name = parsed.data.name;
  if (parsed.data.email) lead.email = parsed.data.email;
  if (parsed.data.phone) lead.phone = parsed.data.phone;
  if (parsed.data.propertyInterest) lead.propertyInterest = parsed.data.propertyInterest;
  if (parsed.data.budget) lead.budget = parsed.data.budget;
  if (parsed.data.status) lead.status = parsed.data.status;
  if (typeof parsed.data.notes === "string") lead.notes = parsed.data.notes;
  if (parsed.data.status === "done") {
    lead.followUpDate = undefined;
  } else if (parsed.data.followUpDate === null || parsed.data.followUpDate === "") {
    lead.followUpDate = undefined;
  } else if (parsed.data.followUpDate) {
    lead.followUpDate = new Date(parsed.data.followUpDate);
  }
  lead.lastActivityAt = new Date();
  await lead.save();

  const changedFields = [
    parsed.data.status ? `status set to ${parsed.data.status}` : null,
    parsed.data.followUpDate ? `follow-up scheduled for ${new Date(parsed.data.followUpDate).toLocaleString()}` : null,
    parsed.data.status === "done" ? "follow-up cleared" : null,
    parsed.data.notes ? "notes updated" : null,
    parsed.data.budget ? `budget updated to ${parsed.data.budget}` : null
  ].filter(Boolean);

  await createActivityLog({
    leadId: id,
    action:
      parsed.data.status === "done"
        ? "lead_completed"
        : parsed.data.status
          ? "lead_status_updated"
          : parsed.data.followUpDate
            ? "lead_followup_updated"
            : "lead_updated",
    performedBy: token.sub,
    details: changedFields.length ? changedFields.join(", ") : "Lead details updated"
  });
  emitLeadEvent("lead_updated", { leadId: id });
  return ok(lead);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || token.role !== "admin") return fail("Only admins can delete leads", 403);
  await connectDb();
  const deleted = await LeadModel.findByIdAndDelete(id);
  if (!deleted) return fail("Lead not found", 404);
  return ok({ deleted: true });
}
