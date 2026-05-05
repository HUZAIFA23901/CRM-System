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
  assignedTo?: { _id: string; name: string };
  overdue?: boolean;
  inactive?: boolean;
};

export default function AgentLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState({ status: "", priority: "", dateFrom: "", dateTo: "" });
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

  const statusColorMap: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-purple-100 text-purple-700",
    qualified: "bg-green-100 text-green-700",
    closed: "bg-emerald-100 text-emerald-700",
    lost: "bg-slate-100 text-slate-700"
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

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                      {lead.status}
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
