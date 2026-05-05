"use client";

import { useEffect, useState } from "react";

type Agent = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/users/agents").then((r) => r.json())])
      .then((results) => {
        setAgents(results[0].data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Agent Management</h1>
        <p className="mt-2 text-slate-600">Manage your sales team and monitor their performance.</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-500">Loading agents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent._id} className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{agent.email}</p>
                </div>
                <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  {agent.role}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-600">Agent ID: {agent._id}</p>
              </div>
              <button className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && agents.length === 0 && (
        <div className="rounded-lg bg-white p-8 text-center">
          <p className="text-slate-500">No agents found. Add agents to get started.</p>
        </div>
      )}
    </div>
  );
}
