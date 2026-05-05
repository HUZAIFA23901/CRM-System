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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!form.name || !form.email || !form.phone || !form.propertyInterest || form.budget <= 0) {
      setError("All fields are required and budget must be positive");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        budget: Number(form.budget),
        ...(form.followUpDate ? { followUpDate: form.followUpDate } : {})
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create lead");
      }

      setSuccess("Lead created successfully!");
      setForm({ name: "", email: "", phone: "", propertyInterest: "", budget: 0, followUpDate: "" });
      setTimeout(() => {
        setSuccess("");
        onCreated();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid grid-cols-1 gap-2 rounded border bg-white p-4 md:grid-cols-2" onSubmit={submit}>
      <h3 className="col-span-full font-semibold">Create New Lead</h3>
      <input
        className="rounded border p-2"
        placeholder="Lead name *"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        disabled={loading}
      />
      <input
        className="rounded border p-2"
        placeholder="Email *"
        type="email"
        value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        disabled={loading}
      />
      <input
        className="rounded border p-2"
        placeholder="Phone *"
        value={form.phone}
        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        disabled={loading}
      />
      <input
        className="rounded border p-2"
        placeholder="Property interest *"
        value={form.propertyInterest}
        onChange={(e) => setForm((p) => ({ ...p, propertyInterest: e.target.value }))}
        disabled={loading}
      />
      <input
        className="rounded border p-2"
        placeholder="Budget (₹) *"
        type="number"
        value={form.budget}
        onChange={(e) => setForm((p) => ({ ...p, budget: Number(e.target.value) }))}
        disabled={loading}
      />
      <input
        className="rounded border p-2"
        type="datetime-local"
        onChange={(e) => setForm((p) => ({ ...p, followUpDate: new Date(e.target.value).toISOString() }))}
        disabled={loading}
      />
      {error ? <p className="col-span-full text-sm text-red-600">{error}</p> : null}
      {success ? <p className="col-span-full text-sm text-green-600">{success}</p> : null}
      <button
        className="rounded bg-blue-600 p-2 text-white transition disabled:opacity-50 md:col-span-2 hover:bg-blue-700"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Lead"}
      </button>
    </form>
  );
}
