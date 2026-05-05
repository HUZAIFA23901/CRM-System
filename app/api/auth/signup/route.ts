import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { UserModel } from "@/models/User";
import { signupSchema } from "@/middleware/validation";
import { fail, ok } from "@/utils/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    await connectDb();
    const exists = await UserModel.findOne({ email: parsed.data.email });
    if (exists) return fail("User already exists", 409);

    const hash = await bcrypt.hash(parsed.data.password, 12);
    const user = await UserModel.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hash,
      role: "agent"
    });
    return ok({ id: String(user._id), email: user.email, role: user.role }, 201);
  } catch {
    return fail("Unable to signup", 500);
  }
}
