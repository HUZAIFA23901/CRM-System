import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "agent";
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "agent";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "agent";
  }
}
