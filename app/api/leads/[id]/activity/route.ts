import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { ActivityLogModel } from "@/models/ActivityLog";
import { fail, ok } from "@/utils/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return fail("Unauthorized", 401);
  const { id } = await params;
  await connectDb();
  const logs = await ActivityLogModel.find({ leadId: id })
    .populate("performedBy", "name role")
    .sort({ timestamp: -1 });
  return ok(logs);
}
