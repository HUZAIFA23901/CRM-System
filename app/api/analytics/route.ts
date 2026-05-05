import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { getAdminAnalytics } from "@/services/analytics.service";
import { fail, ok } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || token.role !== "admin") return fail("Only admins can access analytics", 403);
  await connectDb();
  const analytics = await getAdminAnalytics();
  return ok(analytics);
}
