"use client";

import { FormEvent, useState } from "react";

export function LeadForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    propertyInterest: "",
    budget: 0,
    followUpDate: ""
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, budget: Number(form.budget) })
    });
    onCreated();
  }

  return (
    <form className="grid grid-cols-1 gap-2 rounded border bg-white p-3 md:grid-cols-2" onSubmit={submit}>
      <input className="rounded border p-2" placeholder="Lead name" onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      <input className="rounded border p-2" placeholder="Email" onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
      <input className="rounded border p-2" placeholder="Phone" onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
      <input className="rounded border p-2" placeholder="Property interest" onChange={(e) => setForm((p) => ({ ...p, propertyInterest: e.target.value }))} />
      <input className="rounded border p-2" placeholder="Budget" type="number" onChange={(e) => setForm((p) => ({ ...p, budget: Number(e.target.value) }))} />
      <input className="rounded border p-2" type="datetime-local" onChange={(e) => setForm((p) => ({ ...p, followUpDate: new Date(e.target.value).toISOString() }))} />
      <button className="rounded bg-blue-600 p-2 text-white md:col-span-2" type="submit">
        Create Lead
      </button>
    </form>
  );
}
