import { Types } from "mongoose";
import { ActivityLogModel } from "@/models/ActivityLog";

export async function createActivityLog(params: {
  leadId: string;
  action: string;
  performedBy: string;
  details?: string;
}) {
  await ActivityLogModel.create({
    leadId: new Types.ObjectId(params.leadId),
    action: params.action,
    performedBy: new Types.ObjectId(params.performedBy),
    details: params.details ?? ""
  });
}
