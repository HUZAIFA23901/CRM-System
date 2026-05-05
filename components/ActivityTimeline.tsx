"use client";

import { useEffect, useState } from "react";

type Activity = {
  _id: string;
  action: string;
  details: string;
  timestamp: string;
  performedBy?: { name: string };
};

export function ActivityTimeline({ leadId }: { leadId: string }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}/activity`);
      const data = await res.json();
      setItems(data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [leadId]);

  return (
    <div className="mt-2 rounded bg-slate-50 p-3 text-xs">
      <p className="mb-2 font-semibold text-slate-700">Activity</p>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">No activity yet</p>
      ) : (
        <div className="space-y-1">
          {items.slice(0, 5).map((it) => (
            <div key={it._id} className="border-l-2 border-blue-300 py-1 pl-2">
              <span className="font-medium text-slate-700">{it.action}</span>
              {it.performedBy ? <span className="text-slate-500"> by {it.performedBy.name}</span> : null}
              {it.details ? <div className="text-slate-600">{it.details}</div> : null}
              <span className="text-slate-400">{new Date(it.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
