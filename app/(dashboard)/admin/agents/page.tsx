"use client";

import { useEffect, useState } from "react";

type Agent = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  leadStats?: {
    totalLeads: number;
    doneLeads: number;
    interestedLeads: number;
    pendingLeads: number;
    notInterestedLeads: number;
    overdueFollowUps: number;
    highPriorityLeads: number;
    lastLeadAssignedAt?: string | null;
  };
};

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
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
              <button
                type="button"
                onClick={() => setSelectedAgent(agent)}
                className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedAgent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Agent Details</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedAgent.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{selectedAgent.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Profile</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium text-slate-900">Role:</span> {selectedAgent.role}</p>
                  <p><span className="font-medium text-slate-900">Agent ID:</span> {selectedAgent._id}</p>
                  {selectedAgent.createdAt ? (
                    <p><span className="font-medium text-slate-900">Joined:</span> {new Date(selectedAgent.createdAt).toLocaleDateString()}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lead Stats</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <StatBox label="Total Leads" value={selectedAgent.leadStats?.totalLeads ?? 0} />
                  <StatBox label="Done" value={selectedAgent.leadStats?.doneLeads ?? 0} />
                  <StatBox label="Interested" value={selectedAgent.leadStats?.interestedLeads ?? 0} />
                  <StatBox label="Pending" value={selectedAgent.leadStats?.pendingLeads ?? 0} />
                  <StatBox label="Not Interested" value={selectedAgent.leadStats?.notInterestedLeads ?? 0} />
                  <StatBox label="Overdue Follow-ups" value={selectedAgent.leadStats?.overdueFollowUps ?? 0} />
                  <StatBox label="High Priority" value={selectedAgent.leadStats?.highPriorityLeads ?? 0} />
                  <StatBox
                    label="Last Updated"
                    value={selectedAgent.leadStats?.lastLeadAssignedAt ? new Date(selectedAgent.leadStats.lastLeadAssignedAt).toLocaleString() : "N/A"}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-6 text-right">
              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && agents.length === 0 && (
        <div className="rounded-lg bg-white p-8 text-center">
          <p className="text-slate-500">No agents found. Add agents to get started.</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
