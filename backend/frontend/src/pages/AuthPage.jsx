import React from "react";
import { useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await auth.login({ email: form.email, password: form.password });
      else await auth.register(form);
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-cloud lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-ink lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
          alt="Analytics dashboard"
        />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <h1 className="max-w-xl text-5xl font-bold leading-tight">Advanced AI Demand Forecasting</h1>
          <p className="mt-5 max-w-lg text-lg text-slate-100">Transform historical product sales into reliable future demand signals and decision-ready reports.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 shadow-panel">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal text-white">
              <Database size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{mode === "login" ? "Sign in" : "Create account"}</p>
              <h2 className="text-2xl font-bold text-ink">Forecast workspace</h2>
            </div>
          </div>
          <div className="mb-6 grid grid-cols-2 rounded-md bg-slate-100 p-1">
            {["login", "register"].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setMode(item)}
                className={`h-10 rounded text-sm font-semibold capitalize ${mode === item ? "bg-white text-teal shadow-sm" : "text-slate-500"}`}
              >
                {item}
              </button>
            ))}
          </div>
          {mode === "register" && (
            <label className="mb-4 block text-sm font-semibold text-slate-600">
              Name
              <input className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-teal" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
          )}
          <label className="mb-4 block text-sm font-semibold text-slate-600">
            Email
            <input type="email" className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-teal" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label className="mb-4 block text-sm font-semibold text-slate-600">
            Password
            <input type="password" className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-teal" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} />
          </label>
          {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal font-bold text-white hover:bg-teal/90" disabled={loading}>
            {loading && <Loader2 className="animate-spin" size={18} />}
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </section>
    </div>
  );
}