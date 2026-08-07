import { useState } from "react";
import { BarChart3, Truck } from "lucide-react";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui";

const loginInputCls =
  "w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const demos = [
  { label: "Owner", email: "owner@trucking.ph", password: "admin123" },
  { label: "Office Staff", email: "grace@trucking.ph", password: "staff123" },
  { label: "Accountant", email: "carlo@trucking.ph", password: "acct123" },
];

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("owner@trucking.ph");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) setError(res.error ?? "Login failed");
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FastHaul Operations</h1>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Truck className="h-3 w-3" /> Trucking Service Management
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl"
        >
          <h2 className="mb-1 text-lg font-semibold text-white">Sign in</h2>
          <p className="mb-5 text-sm text-slate-400">Owner & office staff access only.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-baseline gap-1 text-xs font-medium text-slate-300">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={loginInputCls}
                required
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-baseline gap-1 text-xs font-medium text-slate-300">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={loginInputCls}
                required
                autoComplete="current-password"
              />
            </label>
          </div>

          <Button type="submit" className="mt-6 w-full">
            Sign in
          </Button>
        </form>

        <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
            Demo accounts
          </p>
          <div className="grid gap-2">
            {demos.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                  setError("");
                }}
                className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2 text-left text-xs hover:border-blue-500 hover:bg-slate-700/40"
              >
                <span className="font-medium text-slate-200">{d.label}</span>
                <span className="text-slate-400">
                  {d.email} / {d.password}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
