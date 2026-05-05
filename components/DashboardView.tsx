"use client";

import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import Link from "next/link";

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
  followUpDate?: string;
  lastActivityAt?: string;
  assignedTo?: { _id: string; name: string };
  overdue?: boolean;
  inactive?: boolean;
};

type AnalyticsData = {
  totalLeads: number;
  byStatus: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  perAgent: Array<{ agentName: string; count: number }>;
};

export function DashboardView({ role }: { role: Role }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(data.data ?? []);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (role !== "admin") return;
    const res = await fetch("/api/analytics");
    const data = await res.json();
    setAnalytics(data.data ?? null);
  }, [role]);

  useEffect(() => {
    fetch("/api/socket");
    fetchLeads();
    fetchAnalytics();
  }, [fetchLeads, fetchAnalytics]);

  useEffect(() => {
    const socket = io({ path: "/api/socket" });
    socket.on("lead_created", () => fetchLeads());
    socket.on("lead_assigned", () => fetchLeads());
    socket.on("lead_updated", () => fetchLeads());
    return () => {
      socket.disconnect();
    };
  }, [fetchLeads]);

  const statusColorMap: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-purple-100 text-purple-700",
    qualified: "bg-green-100 text-green-700",
    closed: "bg-emerald-100 text-emerald-700",
    lost: "bg-slate-100 text-slate-700"
  };

  const recentLeads = leads.slice(0, 5);
  const overdueLeads = leads.filter((lead) => lead.overdue).length;
  const staleLeads = leads.filter((lead) => lead.inactive).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-slate-900">
          <p className="text-sm text-slate-600">Active Leads</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{leads.length}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-amber-500">
          <p className="text-sm text-slate-600">Pending Follow-ups</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{overdueLeads}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-rose-500">
          <p className="text-sm text-slate-600">Stale Leads</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{staleLeads}</p>
        </div>
      </div>

      {role === "admin" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-slate-600">Total Leads</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{analytics?.totalLeads ?? 0}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-slate-600">High Priority</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {analytics?.byPriority
                ? analytics.byPriority.find((p) => p._id === "High")?.count ?? 0
                : 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-purple-500">
            <p className="text-sm text-slate-600">New Leads</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {analytics?.byStatus ? analytics.byStatus.find((s) => s._id === "new")?.count ?? 0 : 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-emerald-500">
            <p className="text-sm text-slate-600">Closed Deals</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {analytics?.byStatus ? analytics.byStatus.find((s) => s._id === "closed")?.count ?? 0 : 0}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {role === "admin" ? "Recent Leads" : "Recent Assigned Leads"}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Lead Name</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Priority</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Budget</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => {
                const statusColor = statusColorMap[lead.status] || "bg-slate-100 text-slate-700";
                return (
                  <tr key={lead._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.propertyInterest}</div>
                      {lead.followUpDate ? (
                        <div className="mt-1 text-xs text-amber-700">Follow-up: {new Date(lead.followUpDate).toLocaleDateString()}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                        {lead.status}
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
                    <td className="px-6 py-3 font-medium text-slate-900">₹{(lead.budget / 1000000).toFixed(1)}M</td>
                    <td className="px-6 py-3 text-slate-600">{lead.assignedTo?.name ?? "Unassigned"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-6 py-3 text-right">
          <Link
            href={role === "admin" ? "/admin/leads" : "/agent/leads"}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All Leads →
          </Link>
        </div>
      </div>
    </div>
  );
}
