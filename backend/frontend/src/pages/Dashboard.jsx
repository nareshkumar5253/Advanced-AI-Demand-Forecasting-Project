import React from "react";
import {
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

export default function Dashboard() {
  const salesData = [
    { month: "Jan", sales: 1200 },
    { month: "Feb", sales: 1500 },
    { month: "Mar", sales: 1700 },
    { month: "Apr", sales: 1400 },
    { month: "May", sales: 2000 },
    { month: "Jun", sales: 2400 }
  ];

  const productData = [
    { name: "Laptop", value: 45 },
    { name: "Mobile", value: 30 },
    { name: "Tablet", value: 25 }
  ];

  return (
    <div className="space-y-6 p-4 bg-gray-100 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-black">
          Analytics Overview
        </h1>

        <p className="text-gray-700 mt-2 text-lg">
          Demand intelligence dashboard
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-lg border">
          <h3 className="text-gray-500 text-sm font-semibold">
            Total Sales
          </h3>

          <p className="mt-3 text-4xl font-bold text-black">
            $35,000
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg border">
          <h3 className="text-gray-500 text-sm font-semibold">
            Forecast Accuracy
          </h3>

          <p className="mt-3 text-4xl font-bold text-green-700">
            94%
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg border">
          <h3 className="text-gray-500 text-sm font-semibold">
            Uploaded Datasets
          </h3>

          <p className="mt-3 text-4xl font-bold text-blue-700">
            1
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg border">
          <h3 className="text-gray-500 text-sm font-semibold">
            Forecast Points
          </h3>

          <p className="mt-3 text-4xl font-bold text-orange-600">
            12
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <div className="rounded-xl bg-white p-6 shadow-lg border">
          <h2 className="mb-5 text-2xl font-bold text-black">
            Monthly Sales Trends
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#14B8A6"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl bg-white p-6 shadow-lg border">
          <h2 className="mb-5 text-2xl font-bold text-black">
            Top Products
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  <Cell fill="#14B8A6" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#3B82F6" />
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
 );
}