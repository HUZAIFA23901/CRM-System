"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) return null;

  const isAdmin = session.user?.role === "admin";
  const navItems = isAdmin
    ? [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/leads", label: "Leads", icon: "📋" },
        { href: "/admin/analytics", label: "Analytics", icon: "📈" },
        { href: "/admin/agents", label: "Agents", icon: "👥" }
      ]
    : [
        { href: "/agent", label: "Dashboard", icon: "📊" },
        { href: "/agent/leads", label: "My Leads", icon: "📋" },
        { href: "/agent/activity", label: "Activity", icon: "⚡" }
      ];

  const isActive = (href: string) => pathname && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold">
              P
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900">Property CRM</h1>
              <p className="text-xs text-slate-500 capitalize">{session.user?.role} Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-medium text-slate-900">{session.user?.name}</p>
              <p className="text-xs text-slate-500">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-700"
            >
              ≡
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-slate-50 py-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
