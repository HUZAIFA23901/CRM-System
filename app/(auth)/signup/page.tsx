"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      return setError(payload?.message ?? "Signup failed");
    }

    const signInResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false
    });

    if (signInResult?.error) {
      router.push("/login");
      return;
    }

    router.push("/agent");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.2),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.15),_transparent_28%)]" />
      <form className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur" onSubmit={onSubmit}>
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Join the CRM</p>
        <h1 className="mt-3 text-3xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-slate-300">New registrations are created as agent accounts.</p>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-emerald-400" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-emerald-400" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <button className="mt-6 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-300" type="submit">
          Sign up
        </button>
      </form>
    </main>
  );
}
