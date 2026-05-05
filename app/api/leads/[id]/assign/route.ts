import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { LeadModel } from "@/models/Lead";
import { UserModel } from "@/models/User";
import { createActivityLog } from "@/services/activity.service";
import { sendLeadAssignedEmail } from "@/services/mail.service";
import { fail, ok } from "@/utils/api-response";
import { emitLeadEvent } from "@/utils/socket-events";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || token.role !== "admin") return fail("Only admins can assign", 403);
  const { assignedTo } = await req.json();
  if (!assignedTo) return fail("assignedTo is required", 422);

  await connectDb();
  const lead = await LeadModel.findById(id);
  if (!lead) return fail("Lead not found", 404);
  const agent = await UserModel.findById(assignedTo);
  if (!agent || agent.role !== "agent") return fail("Invalid agent", 422);

  lead.assignedTo = agent._id;
  lead.lastActivityAt = new Date();
  await lead.save();

  await createActivityLog({
    leadId: id,
    action: "lead_assigned",
    performedBy: token.sub,
    details: `Lead assigned to ${agent.name}`
  });

  if (agent.email) await sendLeadAssignedEmail(String(agent.email), lead.name);
  emitLeadEvent("lead_assigned", { leadId: id, assignedTo });
  return ok(lead);
}
