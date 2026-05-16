import React from "react";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-black">
          Export Forecasting Reports
        </h1>

        <p className="mt-3 text-xl text-gray-700">
          Download and analyze forecasting results
        </p>
      </div>

      {/* Dataset Card */}
      <div className="rounded-2xl bg-white p-8 shadow-2xl border border-gray-300">
        <h2 className="text-3xl font-bold text-black mb-6">
          Uploaded Dataset
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-xl border border-gray-300 bg-gray-50 p-6">
          <div>
            <p className="text-2xl font-bold text-black">
              sales.csv
            </p>

            <p className="mt-2 text-lg text-gray-700">
              Forecast dataset ready for export
            </p>
          </div>

          <button className="rounded-xl bg-black px-8 py-4 text-xl font-bold text-white shadow-lg hover:bg-gray-800">
            Download Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-xl border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-500">
            Total Forecasts
          </h3>

          <p className="mt-3 text-5xl font-bold text-black">
            12
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-500">
            Accuracy
          </h3>

          <p className="mt-3 text-5xl font-bold text-green-700">
            94%
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-500">
            Status
          </h3>

          <p className="mt-3 text-5xl font-bold text-blue-700">
            Ready
          </p>
        </div>
      </div>
    </div>
  );
}