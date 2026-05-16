import React, { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function ForecastPage({
  datasets,
  selectedDatasetId,
  onDatasetChange
}) {
  const [periods, setPeriods] = useState(6);

  const [loading, setLoading] = useState(false);

  const [forecastData, setForecastData] = useState([]);

  const runForecast = async () => {
    setLoading(true);

    setTimeout(() => {
      setForecastData([
        { date: "Jan", predicted_demand: 1200, accuracy: 90 },
        { date: "Feb", predicted_demand: 1500, accuracy: 91 },
        { date: "Mar", predicted_demand: 1700, accuracy: 92 },
        { date: "Apr", predicted_demand: 1400, accuracy: 93 },
        { date: "May", predicted_demand: 2000, accuracy: 94 },
        { date: "Jun", predicted_demand: 2300, accuracy: 95 }
      ]);

      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal">
            AI Forecasting
          </p>

          <h2 className="text-3xl font-bold text-ink">
            Generate future demand predictions
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-11 min-w-64 rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-teal"
            value={selectedDatasetId || ""}
            onChange={(event) => onDatasetChange(event.target.value)}
          >
            <option value="">Select dataset</option>

            {datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            max="24"
            value={periods}
            onChange={(event) => setPeriods(event.target.value)}
            className="h-11 w-24 rounded-md border border-slate-200 px-3 outline-none focus:border-teal"
          />

          <button
            onClick={runForecast}
            disabled={!selectedDatasetId || loading}
            className="flex h-11 items-center gap-2 rounded-md bg-teal px-5 font-bold text-white disabled:bg-slate-300"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Wand2 size={18} />
            )}

            Run
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="mb-4 text-lg font-bold text-ink">
          Forecast Graph
        </h3>

        <div className="h-[430px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="predicted_demand"
                name="Predicted Demand"
                stroke="#0F766E"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="accuracy"
                name="Accuracy"
                stroke="#D97706"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
