import { Schema, model, models, InferSchemaType, Types } from "mongoose";

const leadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    propertyInterest: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0, index: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed", "lost"],
      default: "new",
      index: true
    },
    notes: { type: String, default: "" },
    assignedTo: { type: Types.ObjectId, ref: "User", index: true },
    score: { type: String, enum: ["High", "Medium", "Low"], required: true, index: true },
    followUpDate: { type: Date, index: true },
    lastActivityAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type Lead = InferSchemaType<typeof leadSchema>;
export const LeadModel = models.Lead || model("Lead", leadSchema);
