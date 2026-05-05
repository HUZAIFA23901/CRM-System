"use client";

import { useEffect, useState } from "react";

type AnalyticsData = {
  totalLeads: number;
  byStatus: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  perAgent: Array<{ agentName: string; count: number }>;
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setAnalytics(d.data ?? null);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="mt-2 text-slate-600">System-wide performance metrics and insights.</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Total Leads</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.totalLeads ?? 0}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">By Status</p>
            <div className="mt-3 space-y-1">
              {Array.isArray(analytics.byStatus) &&
                analytics.byStatus.map((item) => (
                  <div key={item._id} className="flex justify-between text-xs">
                    <span className="text-slate-600 capitalize">{item._id}:</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">By Priority</p>
            <div className="mt-3 space-y-1">
              {Array.isArray(analytics.byPriority) &&
                analytics.byPriority.map((item) => (
                  <div key={item._id} className="flex justify-between text-xs">
                    <span className="text-slate-600">{item._id}:</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Leads Per Agent</p>
            <div className="mt-3 space-y-1">
              {Array.isArray(analytics.perAgent) &&
                analytics.perAgent.slice(0, 5).map((item) => (
                  <div key={item.agentName} className="flex justify-between text-xs">
                    <span className="text-slate-600 truncate">{item.agentName}:</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
