import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { UserModel } from "@/models/User";
import { fail, ok } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || token.role !== "admin") return fail("Only admins can view agents", 403);
  await connectDb();
  const agents = await UserModel.find({ role: "agent" }).select("name email role");
  return ok(agents);
}
