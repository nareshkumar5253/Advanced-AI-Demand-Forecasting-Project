import React from "react";
import {
  BarChart3,
  Database,
  FileText,
  LineChart,
  LogOut,
  UploadCloud
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "upload", label: "Dataset Upload", icon: UploadCloud },
  { id: "forecast", label: "Forecast", icon: LineChart },
  { id: "reports", label: "Reports", icon: FileText }
];

export default function Layout({
  activePage,
  onPageChange,
  children
}) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 bg-slate-900 px-5 py-6 shadow-2xl lg:block">
        
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-500 text-white shadow-lg">
            <Database size={24} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-300">
              Advanced AI
            </p>

            <h1 className="text-2xl font-bold text-white">
              Demand Forecasting
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-12 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-base font-semibold transition-all duration-300 ${
                  active
                    ? "bg-cyan-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-md px-6 py-4">
          
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-gray-600 text-sm">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold text-slate-900">
                {user?.name || "Forecast Analyst"}
              </h2>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="grid h-12 w-12 place-items-center rounded-xl bg-red-500 text-white shadow-lg hover:bg-red-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <section className="p-6">
          {children}
        </section>
      </main>
    </div>
  );
}