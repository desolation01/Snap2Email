import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { TrendingDown, TrendingUp, Truck, Wallet, Coins } from "lucide-react";
import { useStore } from "../lib/store";
import {
  buildSeries,
  computeKpis,
  driverLeaders,
  expenseBreakdown,
  pickGranularity,
  rangeFor,
  tripsInRange,
  vehicleBreakdown,
  type QuickRange,
} from "../lib/analytics";
import { Card, Select, cx } from "../components/ui";
import { peso, peso0 } from "../lib/format";
import type { PageKey } from "../components/Layout";

const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

const rangeOptions: Array<{ key: QuickRange; label: string }> = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "quarter", label: "This Quarter" },
  { key: "year", label: "This Year" },
];

export function Dashboard({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const data = useStore();
  const [quick, setQuick] = useState<QuickRange>("month");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");

  const range = rangeFor(quick);

  const filteredTrips = useMemo(
    () =>
      tripsInRange(data, range).filter((t) => {
        if (vehicleFilter && data.vehicles.find((v) => v.id === t.vehicle_id)?.type !== vehicleFilter)
          return false;
        if (driverFilter && t.driver_id !== driverFilter) return false;
        return true;
      }),
    [data, range, vehicleFilter, driverFilter]
  );

  const kpis = useMemo(() => computeKpis(filteredTrips), [filteredTrips]);
  const granularity = pickGranularity(range);
  const series = useMemo(() => buildSeries(filteredTrips, range, granularity), [filteredTrips, range, granularity]);
  const vBreakdown = useMemo(() => vehicleBreakdown(filteredTrips, data), [filteredTrips, data]);
  const eBreakdown = useMemo(() => expenseBreakdown(filteredTrips), [filteredTrips]);
  const leaders = useMemo(() => driverLeaders(filteredTrips, data), [filteredTrips, data]);

  const chartTooltip = (formatter: (v: number) => string) => ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
        <p className="mb-1 font-medium text-slate-700">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? p.fill }} />
            <span className="capitalize text-slate-500">{String(p.name).replace("_", " ")}:</span>
            <span className="font-medium text-slate-800">{formatter(p.value)}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {rangeOptions.map((o) => (
            <button
              key={o.key}
              onClick={() => setQuick(o.key)}
              className={cx(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                quick === o.key ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} className="w-44 py-1.5 text-xs">
            <option value="">All vehicle types</option>
            {data.vehicleTypes.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </Select>
          <Select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} className="w-48 py-1.5 text-xs">
            <option value="">All drivers</option>
            {data.employees.filter((e) => e.role === "driver" && e.status === "active").map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={<Coins className="h-5 w-5" />} label="Total Gross" value={peso0(kpis.gross)} tone="blue" />
        <KpiCard icon={<Wallet className="h-5 w-5" />} label="Total Expense" value={peso0(kpis.expense)} tone="amber" />
        <KpiCard
          icon={kpis.profit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          label="Total Profit"
          value={peso0(kpis.profit)}
          tone={kpis.profit >= 0 ? "green" : "red"}
        />
        <KpiCard icon={<Truck className="h-5 w-5" />} label="Total Trips" value={String(kpis.trips)} tone="violet" sub={`${kpis.cancelled} cancelled`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Income vs Expense" subtitle={range.label}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                <Tooltip content={chartTooltip((v) => peso(v))} cursor={{ fill: "#f1f5f9" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="gross" name="Income" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expense" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Gross by Vehicle Type" subtitle="Share of gross revenue">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vBreakdown} dataKey="gross" nameKey="type" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {vBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={chartTooltip((v) => peso(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {vBreakdown.map((v, i) => (
              <div key={v.type} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  {v.type}
                </span>
                <span className="font-medium text-slate-800">{peso0(v.gross)}</span>
              </div>
            ))}
            {vBreakdown.length === 0 && <p className="text-center text-xs text-slate-400">No data</p>}
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Profit Trend" subtitle="Profit over selected period">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                <Tooltip content={chartTooltip((v) => peso(v))} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Expense Breakdown" subtitle="By category">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eBreakdown} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {eBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={chartTooltip((v) => peso(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {eBreakdown.map((e, i) => (
              <div key={e.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  {e.category}
                </span>
                <span className="font-medium text-slate-800">{peso0(e.amount)}</span>
              </div>
            ))}
            {eBreakdown.length === 0 && <p className="text-center text-xs text-slate-400">No expenses</p>}
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Trip Volume" subtitle="Trips over selected period">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={chartTooltip((v) => String(v))} />
                <Line type="monotone" dataKey="trips" name="Trips" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Top Drivers"
          subtitle="By profit generated"
          actions={
            <button onClick={() => onNavigate("payroll")} className="text-xs font-medium text-blue-600 hover:underline">
              Payroll →
            </button>
          }
        >
          <div className="space-y-3">
            {leaders.slice(0, 6).map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">{d.name}</p>
                  <p className="text-[11px] text-slate-400">{d.trips} trips · {peso0(d.gross)} gross</p>
                </div>
                <span className={cx("text-sm font-semibold", d.profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {peso0(d.profit)}
                </span>
              </div>
            ))}
            {leaders.length === 0 && <p className="py-6 text-center text-xs text-slate-400">No trip data in range</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "blue" | "amber" | "green" | "red" | "violet";
  sub?: string;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cx("flex h-10 w-10 items-center justify-center rounded-lg", tones[tone])}>{icon}</div>
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-2 text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}
