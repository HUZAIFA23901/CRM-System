import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { LeadModel } from "@/models/Lead";
import { UserModel } from "@/models/User";
import { fail, ok } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || token.role !== "admin") return fail("Only admins can view agents", 403);
  await connectDb();

  const agents = await UserModel.find({ role: "agent" }).select("name email role createdAt").lean();
  const leadStats = await LeadModel.aggregate([
    { $match: { assignedTo: { $ne: null } } },
    {
      $group: {
        _id: "$assignedTo",
        totalLeads: { $sum: 1 },
        doneLeads: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
        interestedLeads: { $sum: { $cond: [{ $eq: ["$status", "client_interested"] }, 1, 0] } },
        pendingLeads: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        notInterestedLeads: { $sum: { $cond: [{ $eq: ["$status", "not_interested"] }, 1, 0] } },
        overdueFollowUps: { $sum: { $cond: [{ $and: [{ $ne: ["$followUpDate", null] }, { $lt: ["$followUpDate", new Date()] }] }, 1, 0] } },
        highPriorityLeads: { $sum: { $cond: [{ $eq: ["$score", "High"] }, 1, 0] } },
        lastLeadAssignedAt: { $max: "$updatedAt" }
      }
    }
  ]);

  const statsMap = new Map<string, (typeof leadStats)[number]>();
  for (const stat of leadStats) {
    statsMap.set(String(stat._id), stat);
  }

  const enrichedAgents = agents.map((agent) => {
    const stats = statsMap.get(String(agent._id));
    return {
      ...agent,
      leadStats: {
        totalLeads: stats?.totalLeads ?? 0,
        doneLeads: stats?.doneLeads ?? 0,
        interestedLeads: stats?.interestedLeads ?? 0,
        pendingLeads: stats?.pendingLeads ?? 0,
        notInterestedLeads: stats?.notInterestedLeads ?? 0,
        overdueFollowUps: stats?.overdueFollowUps ?? 0,
        highPriorityLeads: stats?.highPriorityLeads ?? 0,
        lastLeadAssignedAt: stats?.lastLeadAssignedAt ?? null
      }
    };
  });

  return ok(enrichedAgents);
}
