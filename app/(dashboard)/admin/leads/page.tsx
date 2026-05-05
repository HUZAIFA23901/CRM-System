"use client";

import { useCallback, useEffect, useState } from "react";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { LeadForm } from "@/components/LeadForm";
import { whatsappLink } from "@/utils/whatsapp";

type Lead = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  status: string;
  score: string;
  followUpDate?: string;
  assignedTo?: { _id: string; name: string };
  overdue?: boolean;
  inactive?: boolean;
};

const statusLabelMap: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
  lost: "Lost",
  done: "Done",
  client_interested: "Client Interested",
  not_interested: "Not Interested",
  pending: "Pending",
  did_not_contact: "Did Not Contact"
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<{ _id: string; name: string }[]>([]);
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
    const res = await fetch("/api/users/agents");
    const data = await res.json();
    setAgents(data.data ?? []);
  }, []);

  useEffect(() => {
    Promise.all([fetchLeads(), fetchAgents()]);
  }, [fetchLeads, fetchAgents]);

  async function assignLead(leadId: string, agentId: string) {
    await fetch(`/api/leads/${leadId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: agentId })
    });
    fetchLeads();
  }

  const statusColorMap: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-purple-100 text-purple-700",
    qualified: "bg-green-100 text-green-700",
    closed: "bg-emerald-100 text-emerald-700",
    lost: "bg-slate-100 text-slate-700",
    client_interested: "bg-emerald-100 text-emerald-700",
    not_interested: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-700",
    did_not_contact: "bg-slate-100 text-slate-700"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Lead Management</h1>
        <p className="mt-2 text-slate-600">Create, view, and manage all leads in the system.</p>
      </div>

      <LeadForm onCreated={fetchLeads} />

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Filters</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            className="rounded-lg border border-slate-200 p-2 text-sm"
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
            <option value="done">Done</option>
            <option value="client_interested">Client Interested</option>
            <option value="not_interested">Not Interested</option>
            <option value="pending">Pending</option>
            <option value="did_not_contact">Did Not Contact</option>
          </select>
          <select
            className="rounded-lg border border-slate-200 p-2 text-sm"
            value={filters.priority}
            onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
          >
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
          />
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Lead Name</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Contact</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Priority</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Budget</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Assigned To</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const isHighPriority = lead.score === "High";
                const statusColor = statusColorMap[lead.status] || "bg-slate-100 text-slate-700";

                return (
                  <>
                    <tr key={lead._id} className={`border-b border-slate-100 ${isHighPriority ? "bg-red-50" : ""}`}>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.propertyInterest}</div>
                        {lead.overdue ? <div className="mt-1 text-xs font-medium text-rose-600">⏰ Overdue follow-up</div> : null}
                        {lead.inactive ? <div className="mt-1 text-xs font-medium text-amber-600">Stale activity</div> : null}
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-slate-900">{lead.email}</div>
                        <div className="text-xs text-slate-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                          {statusLabelMap[lead.status] ?? lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            lead.score === "High"
                              ? "bg-red-100 text-red-700"
                              : lead.score === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {lead.score}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-900 font-medium">₹{(lead.budget / 1000000).toFixed(1)}M</td>
                      <td className="px-6 py-3">
                        <select
                          className="rounded-lg border border-slate-200 p-1 text-sm"
                          value={lead.assignedTo?._id ?? ""}
                          onChange={(e) => assignLead(lead._id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <a
                          href={whatsappLink(lead.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-700"
                        >
                          💬 WhatsApp
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <td className="px-6 py-4" colSpan={7}>
                        <ActivityTimeline leadId={lead._id} />
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
