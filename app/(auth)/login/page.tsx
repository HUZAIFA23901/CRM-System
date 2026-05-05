"use client";

import { FormEvent, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) return setError("Invalid credentials");
    const session = await getSession();
    router.push(session?.user?.role === "admin" ? "/admin" : "/agent");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_30%)]" />
      <form className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur" onSubmit={onSubmit}>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Property Dealer CRM</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-300">Access your dashboard with your secure account.</p>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-cyan-400" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <button className="mt-6 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300" type="submit">
          Sign in
        </button>
        <p className="mt-4 text-sm text-slate-300">
          New user? <a className="text-cyan-300 transition hover:text-cyan-200" href="/signup">Create account</a>
        </p>
      </form>
    </main>
  );
}
