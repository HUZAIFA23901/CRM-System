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

  useEffect(() => {
    fetch(`/api/leads/${leadId}/activity`)
      .then((r) => r.json())
      .then((d) => setItems(d.data ?? []));
  }, [leadId]);

  return (
    <div className="mt-2 rounded bg-slate-50 p-2 text-xs">
      {items.length === 0 ? (
        <p className="text-slate-500">No activity yet</p>
      ) : (
        items.slice(0, 4).map((it) => (
          <p key={it._id} className="mb-1">
            <span className="font-medium">{it.action}</span> - {it.details} ({new Date(it.timestamp).toLocaleString()})
          </p>
        ))
      )}
    </div>
  );
}
