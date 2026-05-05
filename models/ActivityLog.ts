import { Schema, model, models, InferSchemaType, Types } from "mongoose";

const activityLogSchema = new Schema(
  {
    leadId: { type: Types.ObjectId, ref: "Lead", required: true, index: true },
    action: { type: String, required: true },
    performedBy: { type: Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    details: { type: String, default: "" }
  },
  { versionKey: false }
);

export type ActivityLog = InferSchemaType<typeof activityLogSchema>;
export const ActivityLogModel = models.ActivityLog || model("ActivityLog", activityLogSchema);
