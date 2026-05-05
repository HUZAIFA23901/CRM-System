import { DashboardView } from "@/components/DashboardView";

export const metadata = {
  title: "Admin Dashboard | Property CRM"
};

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome back! Here&apos;s your CRM overview.</p>
      </div>
      <DashboardView role="admin" />
    </div>
  );
}
