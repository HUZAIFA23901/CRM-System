"use client";

import { useEffect, useState } from "react";

type AnalyticsData = {
  totalLeads: number;
  byStatus: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  perAgent: Array<{ agentName: string; count: number }>;
};

const statusLabels: Record<string, string> = {
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

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setAnalytics(d.data ?? null))
      .finally(() => setLoading(false));
  }, []);

  const statusOrder = ["new", "contacted", "qualified", "closed", "lost", "done", "client_interested", "not_interested", "pending", "did_not_contact"];
  const priorityOrder = ["High", "Medium", "Low"];

  const statusCounts = statusOrder.map((status) => ({
    label: status,
    count: analytics?.byStatus.find((item) => item._id === status)?.count ?? 0
  }));

  const priorityCounts = priorityOrder.map((priority) => ({
    label: priority,
    count: analytics?.byPriority.find((item) => item._id === priority)?.count ?? 0
  }));

  const topAgents = (analytics?.perAgent ?? []).slice(0, 5);
  const maxStatusCount = Math.max(1, ...statusCounts.map((item) => item.count));
  const maxPriorityCount = Math.max(1, ...priorityCounts.map((item) => item.count));
  const maxAgentCount = Math.max(1, ...topAgents.map((item) => item.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="mt-2 text-slate-600">System-wide performance metrics and insights.</p>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      ) : analytics ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Total Leads</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.totalLeads ?? 0}</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Status Buckets</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.byStatus.length}</p>
              <p className="mt-1 text-xs text-slate-500">Tracked lead states</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Priority Buckets</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.byPriority.length}</p>
              <p className="mt-1 text-xs text-slate-500">High / medium / low</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Active Agents</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.perAgent.length}</p>
              <p className="mt-1 text-xs text-slate-500">Agents handling leads</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Lead Distribution by Status</p>
                  <h2 className="text-lg font-semibold text-slate-900">Status Chart</h2>
                </div>
                <span className="text-xs text-slate-500">{analytics.totalLeads} total</span>
              </div>

              <div className="mt-5 space-y-4">
                {statusCounts.map((item) => {
                  const width = `${(item.count / maxStatusCount) * 100}%`;
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{statusLabels[item.label] ?? item.label}</span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 transition-all" style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Lead Distribution by Priority</p>
                  <h2 className="text-lg font-semibold text-slate-900">Priority Chart</h2>
                </div>
                <span className="text-xs text-slate-500">Top 3 levels</span>
              </div>

              <div className="mt-5 space-y-4">
                {priorityCounts.map((item) => {
                  const width = `${(item.count / maxPriorityCount) * 100}%`;
                  const barClass =
                    item.label === "High"
                      ? "from-rose-500 to-red-500"
                      : item.label === "Medium"
                        ? "from-amber-400 to-yellow-500"
                        : "from-slate-400 to-slate-500";

                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className={`h-3 rounded-full bg-gradient-to-r ${barClass} transition-all`} style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Agent Performance Overview</p>
                <h2 className="text-lg font-semibold text-slate-900">Leads Handled per Agent</h2>
              </div>
              <span className="text-xs text-slate-500">Top 5 agents</span>
            </div>

            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[640px] space-y-4">
                {topAgents.map((item) => {
                  const width = `${(item.count / maxAgentCount) * 100}%`;
                  return (
                    <div key={item.agentName}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="truncate pr-3 font-medium text-slate-700">{item.agentName}</span>
                        <span className="text-slate-500">{item.count} leads</span>
                      </div>
                      <div className="h-4 rounded-full bg-slate-100">
                        <div className="h-4 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all" style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
