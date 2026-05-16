import React from "react";

export default function MetricCard({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className={`mb-4 h-1.5 w-14 rounded-full ${accent || "bg-teal"}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}