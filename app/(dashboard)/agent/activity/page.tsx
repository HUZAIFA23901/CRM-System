"use client";

import { useEffect, useState } from "react";

type Activity = {
  _id: string;
  action: string;
  details: string;
  timestamp: string;
  performedBy?: { name: string };
  leadId: {
    _id: string;
    name: string;
  };
};

export default function AgentActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.data && Array.isArray(data.data)) {
          const allActivities: Activity[] = [];
          for (const lead of data.data) {
            const actRes = await fetch(`/api/leads/${lead._id}/activity`);
            const actData = await actRes.json();
            if (actData.data) {
              allActivities.push(
                ...actData.data.map((act: Record<string, unknown>) => ({
                  ...act,
                  leadId: { _id: lead._id, name: lead.name }
                }))
              );
            }
          }
          setActivities(allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case "lead_created":
        return "bg-blue-100 text-blue-700";
      case "lead_assigned":
        return "bg-purple-100 text-purple-700";
      case "lead_updated":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Activity Log</h1>
        <p className="mt-2 text-slate-600">Track all lead-related activities and updates.</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-500">Loading activities...</p>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {activities.length > 0 ? (
              activities.map((activity: Activity) => (
                <div key={activity._id} className="px-6 py-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getActionColor(activity.action)}`}>
                        {activity.action.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Lead: <span className="text-blue-600">{activity.leadId?.name || "Unknown"}</span>
                      </p>
                      {activity.details && <p className="mt-1 text-sm text-slate-600">{activity.details}</p>}
                      <p className="mt-2 text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-slate-500">No activities yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
