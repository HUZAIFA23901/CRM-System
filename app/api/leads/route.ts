import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { LeadModel } from "@/models/Lead";
import { UserModel } from "@/models/User";
import { leadSchema } from "@/middleware/validation";
import { createActivityLog } from "@/services/activity.service";
import { buildLeadPayload, getLeadsForRole } from "@/services/lead.service";
import { sendLeadAssignedEmail, sendLeadCreatedEmail } from "@/services/mail.service";
import { fail, ok } from "@/utils/api-response";
import { emitLeadEvent } from "@/utils/socket-events";

async function authToken(req: NextRequest) {
  return getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

export async function GET(req: NextRequest) {
  try {
    const token = await authToken(req);
    if (!token?.sub || !token.role) return fail("Unauthorized", 401);
    await connectDb();
    const filters = Object.fromEntries(req.nextUrl.searchParams.entries());
    const leads = await getLeadsForRole(token.sub, token.role as "admin" | "agent", filters);
    const now = new Date();
    const inactiveCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const enriched = leads.map((lead) => ({
      ...lead.toObject(),
      overdue: !!lead.followUpDate && lead.followUpDate < now,
      inactive: !!lead.lastActivityAt && lead.lastActivityAt < inactiveCutoff
    }));
    return ok(enriched);
  } catch {
    return fail("Unable to fetch leads", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await authToken(req);
    if (!token?.sub || !token.role) return fail("Unauthorized", 401);
    await connectDb();
    const json = await req.json();
    const parsed = leadSchema.safeParse(json);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const payload = buildLeadPayload(parsed.data);
    const lead = await LeadModel.create(payload);
    await createActivityLog({
      leadId: String(lead._id),
      action: "lead_created",
      performedBy: token.sub,
      details: `Lead created with status ${lead.status}`
    });

    const creator = (await UserModel.findById(token.sub).lean()) as { email?: string } | null;
    if (creator?.email) await sendLeadCreatedEmail(creator.email, lead.name);
    if (lead.assignedTo) {
      const assignedUser = (await UserModel.findById(lead.assignedTo).lean()) as { email?: string } | null;
      if (assignedUser?.email) await sendLeadAssignedEmail(assignedUser.email, lead.name);
    }
    emitLeadEvent("lead_created", { leadId: String(lead._id) });

    return ok(lead, 201);
  } catch {
    return fail("Unable to create lead", 500);
  }
}
