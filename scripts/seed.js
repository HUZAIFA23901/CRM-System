const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/property-dealer-crm";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["admin", "agent"] }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const leadSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    propertyInterest: String,
    budget: Number,
    status: { type: String, default: "new" },
    notes: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: { type: String, enum: ["High", "Medium", "Low"] },
    followUpDate: Date,
    lastActivityAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const activityLogSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String, default: "" }
  },
  { versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);

function scoreForBudget(budget) {
  if (budget > 20000000) return "High";
  if (budget >= 10000000) return "Medium";
  return "Low";
}

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: "property-dealer-crm" });

  const adminPass = await bcrypt.hash("Admin@123", 12);
  const agentPass = await bcrypt.hash("Agent@123", 12);

  const admin = await User.findOneAndUpdate(
    { email: "admin@crm.local" },
    { name: "System Admin", email: "admin@crm.local", password: adminPass, role: "admin" },
    { upsert: true, new: true }
  );

  const agent = await User.findOneAndUpdate(
    { email: "agent@crm.local" },
    { name: "Primary Agent", email: "agent@crm.local", password: agentPass, role: "agent" },
    { upsert: true, new: true }
  );

  const leadDocs = [
    {
      name: "Rahul Mehta",
      email: "rahul@example.com",
      phone: "9876543210",
      propertyInterest: "3BHK Apartment - Pune",
      budget: 24000000,
      status: "new",
      notes: "Interested in premium location",
      assignedTo: agent._id,
      score: scoreForBudget(24000000),
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Anita Sharma",
      email: "anita@example.com",
      phone: "9988776655",
      propertyInterest: "Villa - Bangalore",
      budget: 15000000,
      status: "contacted",
      notes: "Asked for payment plan options",
      assignedTo: agent._id,
      score: scoreForBudget(15000000),
      followUpDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const item of leadDocs) {
    const lead = await Lead.findOneAndUpdate({ email: item.email }, item, { upsert: true, new: true });
    await ActivityLog.create({
      leadId: lead._id,
      action: "lead_created",
      performedBy: admin._id,
      details: `Seeded lead ${lead.name}`
    });
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@crm.local / Admin@123");
  console.log("Agent login: agent@crm.local / Agent@123");
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
