"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { LeadForm } from "@/components/LeadForm";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { whatsappLink } from "@/utils/whatsapp";

type Role = "admin" | "agent";
type Lead = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  status: string;
  score: string;
  notes?: string;
  overdue?: boolean;
  inactive?: boolean;
  assignedTo?: { _id: string; name: string };
};

export function DashboardView({ role }: { role: Role }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<{ _id: string; name: string }[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [filters, setFilters] = useState({ status: "", priority: "", dateFrom: "", dateTo: "" });

  const fetchLeads = useCallback(async () => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== "")
    ).toString();
    const res = await fetch(`/api/leads${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    setLeads(data.data ?? []);
  }, [filters]);

  const fetchAgents = useCallback(async () => {
    if (role !== "admin") return;
    const res = await fetch("/api/users/agents");
    const data = await res.json();
    setAgents(data.data ?? []);
  }, [role]);

  const fetchAnalytics = useCallback(async () => {
    if (role !== "admin") return;
    const res = await fetch("/api/analytics");
    const data = await res.json();
    setAnalytics(data.data ?? null);
  }, [role]);

  useEffect(() => {
    fetch("/api/socket");
    fetchLeads();
    fetchAgents();
    fetchAnalytics();
  }, [fetchAgents, fetchAnalytics, fetchLeads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, filters.status, filters.priority, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    const socket: Socket = io({ path: "/api/socket" });
    const refresh = () => {
      fetchLeads();
      fetchAnalytics();
    };
    socket.on("lead_created", refresh);
    socket.on("lead_assigned", refresh);
    socket.on("lead_updated", refresh);
    return () => {
      socket.disconnect();
    };
  }, [fetchAnalytics, fetchLeads]);

  const analyticsBlocks = useMemo(() => {
    if (!analytics) return null;
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card title="Total Leads" value={String(analytics.totalLeads ?? 0)} />
        <Card title="By Status" value={JSON.stringify(analytics.byStatus ?? [])} />
        <Card title="By Priority" value={JSON.stringify(analytics.byPriority ?? [])} />
        <Card title="Leads Per Agent" value={JSON.stringify(analytics.perAgent ?? [])} />
      </div>
    );
  }, [analytics]);

  async function assignLead(leadId: string, agentId: string) {
    await fetch(`/api/leads/${leadId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: agentId })
    });
    fetchLeads();
  }

  return (
    <main className="mx-auto max-w-7xl p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{role === "admin" ? "Admin Dashboard" : "Agent Dashboard"}</h1>
        <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </button>
      </header>

      {role === "admin" ? (
        <section className="mb-4">
          <LeadForm onCreated={fetchLeads} />
        </section>
      ) : null}

      {role === "admin" ? <section className="mb-4">{analyticsBlocks}</section> : null}

      <section className="mb-4 grid grid-cols-1 gap-2 rounded border bg-white p-3 md:grid-cols-4">
        <select className="rounded border p-2" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
        <select className="rounded border p-2" value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}>
          <option value="">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <input className="rounded border p-2" type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
        <input className="rounded border p-2" type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
      </section>

      <section className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2">Lead</th>
              <th className="p-2">Status</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Assigned</th>
              <th className="p-2">Flags</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <Fragment key={lead._id}>
                <tr className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-xs text-slate-500">{lead.propertyInterest}</div>
                  </td>
                  <td className="p-2">{lead.status}</td>
                  <td className="p-2">{lead.score}</td>
                  <td className="p-2">
                    {role === "admin" ? (
                      <select className="rounded border p-1" onChange={(e) => assignLead(lead._id, e.target.value)} value={lead.assignedTo?._id ?? ""}>
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      lead.assignedTo?.name ?? "-"
                    )}
                  </td>
                  <td className="p-2">
                    {lead.overdue ? <span className="mr-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700">Overdue</span> : null}
                    {lead.inactive ? <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700">Inactive</span> : null}
                  </td>
                  <td className="p-2">
                    <a className="rounded bg-green-600 px-2 py-1 text-xs text-white" href={whatsappLink(lead.phone)} target="_blank">
                      WhatsApp
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 pb-2" colSpan={6}>
                    <ActivityTimeline leadId={lead._id} />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded border bg-white p-3">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 break-words font-mono text-xs">{value}</p>
    </article>
  );
}
