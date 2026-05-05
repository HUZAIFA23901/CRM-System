import { LeadModel } from "@/models/Lead";

export async function getAdminAnalytics() {
  const [totalLeads, byStatus, byPriority, perAgent] = await Promise.all([
    LeadModel.countDocuments(),
    LeadModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    LeadModel.aggregate([{ $group: { _id: "$score", count: { $sum: 1 } } }]),
    LeadModel.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent"
        }
      },
      { $unwind: "$agent" },
      { $project: { _id: 0, agentName: "$agent.name", count: 1 } }
    ])
  ]);

  return { totalLeads, byStatus, byPriority, perAgent };
}
