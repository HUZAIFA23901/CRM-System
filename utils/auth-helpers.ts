import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAuth() {
  return getServerSession(authOptions);
}

export function isAdmin(role?: string) {
  return role === "admin";
}
