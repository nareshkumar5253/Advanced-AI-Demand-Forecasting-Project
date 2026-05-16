import React from "react";
import { useState } from "react";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";

export default function UploadPage({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async (event) => {
    event.preventDefault();

    if (!file) return;

    setLoading(true);
    setStatus(null);

    setTimeout(() => {
      setStatus({
        type: "success",
        message: `${file.name} uploaded successfully`
      });

      localStorage.setItem(
        "datasets",
        JSON.stringify([
          {
            id: 1,
            name: file.name
          }
        ])
      );

      setLoading(false);

      if (onUploaded) {
        onUploaded(1);
      }
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal">
          Dataset Upload
        </p>

        <h2 className="text-3xl font-bold text-ink">
          Upload historical sales data
        </h2>
      </div>

      <form
        onSubmit={upload}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel"
      >
        <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center hover:border-teal">
          <UploadCloud className="mb-4 text-teal" size={42} />

          <span className="text-lg font-bold text-ink">
            {file ? file.name : "Choose CSV or Excel file"}
          </span>

          <span className="mt-2 text-sm text-slate-500">
            Required columns: date, product, quantity, sales
          </span>

          <input
            className="hidden"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(event) => setFile(event.target.files?.[0])}
          />
        </label>

        {status && (
          <div
            className={`mt-5 flex items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {status.type === "success" && <CheckCircle2 size={18} />}
            {status.message}
          </div>
        )}

        <button
          disabled={!file || loading}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          Upload Dataset
        </button>
      </form>
    </div>
  );
}