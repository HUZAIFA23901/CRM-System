"use client";

import { useCallback, useEffect, useState } from "react";
import { ActivityTimeline } from "@/components/ActivityTimeline";
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

type Draft = {
  status: string;
  followUpDate: string;
};

const agentStatusOptions = [
  { value: "done", label: "Done" },
  { value: "client_interested", label: "Client Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "pending", label: "Pending" },
  { value: "did_not_contact", label: "Did Not Contact" }
];

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

export default function AgentLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState({ status: "", priority: "", dateFrom: "", dateTo: "" });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== "")
    ).toString();
    const res = await fetch(`/api/leads${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    setLeads(data.data ?? []);
  }, [filters]);

  useEffect(() => {
    fetchLeads().finally(() => setLoading(false));
  }, [fetchLeads]);

  useEffect(() => {
    setDrafts((current) => {
      const next: Record<string, Draft> = {};

      for (const lead of leads) {
        next[lead._id] = {
          status: current[lead._id]?.status ?? lead.status,
          followUpDate: current[lead._id]?.followUpDate ?? (lead.followUpDate ? lead.followUpDate.slice(0, 16) : "")
        };
      }

      return next;
    });
  }, [leads]);

  async function saveLead(leadId: string) {
    const draft = drafts[leadId];
    if (!draft) return;

    setSavingLeadId(leadId);
    try {
      const payload: { status?: string; followUpDate?: string | null } = {};
      if (draft.status) payload.status = draft.status;
      if (draft.status === "done") {
        payload.followUpDate = null;
      } else if (draft.followUpDate) {
        payload.followUpDate = new Date(draft.followUpDate).toISOString();
      }

      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update lead");
      }

      await fetchLeads();
    } catch (error) {
      console.error("Unable to update lead", error);
    } finally {
      setSavingLeadId(null);
    }
  }

  const statusColorMap: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-purple-100 text-purple-700",
    qualified: "bg-green-100 text-green-700",
    closed: "bg-emerald-100 text-emerald-700",
    lost: "bg-slate-100 text-slate-700",
    done: "bg-slate-100 text-slate-700",
    client_interested: "bg-emerald-100 text-emerald-700",
    not_interested: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-700",
    did_not_contact: "bg-slate-100 text-slate-700"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Leads</h1>
        <p className="mt-2 text-slate-600">Manage your assigned leads and track progress.</p>
      </div>

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

      <div className="space-y-4">
        {leads.map((lead) => {
          const isHighPriority = lead.score === "High";
          const statusColor = statusColorMap[lead.status] || "bg-slate-100 text-slate-700";

          return (
            <div
              key={lead._id}
              className={`rounded-lg bg-white p-4 shadow-sm border border-slate-200 ${isHighPriority ? "border-red-200" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{lead.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{lead.propertyInterest}</p>
                  {lead.followUpDate ? (
                    <p className="mt-1 text-xs font-medium text-amber-700">
                      Follow-up: {new Date(lead.followUpDate).toLocaleString()}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                      {statusLabelMap[lead.status] ?? lead.status}
                    </span>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        lead.score === "High"
                          ? "bg-red-100 text-red-700"
                          : lead.score === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {lead.score} Priority
                    </span>
                    {isHighPriority && <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">🔴 High Priority</span>}
                    {lead.overdue && <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">⏰ Overdue</span>}
                    {lead.inactive && <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">Stale activity</span>}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Email</p>
                      <p className="font-medium text-slate-900">{lead.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Phone</p>
                      <p className="font-medium text-slate-900">{lead.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Budget</p>
                      <p className="font-medium text-slate-900">₹{(lead.budget / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="text-xs font-medium text-slate-600">
                        Lead Outcome
                        <select
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                          value={drafts[lead._id]?.status ?? lead.status}
                          onChange={(e) =>
                            setDrafts((current) => ({
                              ...current,
                              [lead._id]: {
                                ...(current[lead._id] ?? { followUpDate: "" }),
                                status: e.target.value,
                                followUpDate:
                                  e.target.value === "done"
                                    ? ""
                                    : current[lead._id]?.followUpDate ?? (lead.followUpDate ? lead.followUpDate.slice(0, 16) : "")
                              }
                            }))
                          }
                        >
                          {agentStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs font-medium text-slate-600">
                        Follow-up Date
                        <input
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                          type="datetime-local"
                          value={drafts[lead._id]?.followUpDate ?? ""}
                          disabled={(drafts[lead._id]?.status ?? lead.status) === "done"}
                          onChange={(e) =>
                            setDrafts((current) => ({
                              ...current,
                              [lead._id]: {
                                ...(current[lead._id] ?? { status: lead.status }),
                                followUpDate: e.target.value
                              }
                            }))
                          }
                        />
                        {(drafts[lead._id]?.status ?? lead.status) === "done" ? (
                          <p className="mt-1 text-[11px] text-slate-500">Done leads do not need a follow-up date.</p>
                        ) : null}
                      </label>
                    </div>

                    <button
                      type="button"
                      className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                      onClick={() => saveLead(lead._id)}
                      disabled={savingLeadId === lead._id}
                    >
                      {savingLeadId === lead._id ? "Saving..." : "Save Follow-up / Status"}
                    </button>
                  </div>

                  <div className="mt-4">
                    <ActivityTimeline leadId={lead._id} />
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <a
                    href={whatsappLink(lead.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 text-center"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && leads.length === 0 && (
        <div className="rounded-lg bg-white p-8 text-center">
          <p className="text-slate-500">No leads assigned yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
