import { DashboardView } from "@/components/DashboardView";

export const metadata = {
  title: "Agent Dashboard | Property CRM"
};

export default function AgentDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
        <p className="mt-2 text-slate-600">Track your assigned leads and performance.</p>
      </div>
      <DashboardView role="agent" />
    </div>
  );
}
