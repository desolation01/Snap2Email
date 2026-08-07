import { useMemo, useState } from "react";
import { Download, Wallet } from "lucide-react";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, format } from "date-fns";
import { useStore } from "../lib/store";
import { Button, EmptyState, PageHeader, Select } from "../components/ui";
import { peso, peso0 } from "../lib/format";

interface Row {
  employeeId: string;
  name: string;
  role: string;
  trips: number;
  gross: number;
  commission: number;
  entries: Array<{ transportify: string; date: string; gross: number; amount: number }>;
}

export function Payroll() {
  const data = useStore();
  const now = new Date();
  const [month, setMonth] = useState(format(now, "yyyy-MM"));
  const [sortBy, setSortBy] = useState<"commission" | "trips" | "gross">("commission");

  const range = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const start = startOfDay(startOfMonth(new Date(y, m - 1, 1)));
    const end = endOfDay(endOfMonth(new Date(y, m - 1, 1)));
    return { start, end };
  }, [month]);

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    const trips = data.trips.filter((t) => {
      const d = new Date(t.date_time);
      return d >= range.start && d <= range.end && t.status === "completed";
    });

    for (const t of trips) {
      const driver = data.employees.find((e) => e.id === t.driver_id);
      if (driver) {
        const row = map.get(driver.id) ?? { employeeId: driver.id, name: driver.name, role: "Driver", trips: 0, gross: 0, commission: 0, entries: [] };
        row.trips += 1;
        row.gross += t.gross;
        row.commission += t.driver_commission;
        row.entries.push({ transportify: t.transportify_id, date: t.date_time, gross: t.gross, amount: t.driver_commission });
        map.set(driver.id, row);
      }
      for (const hid of t.helper_ids) {
        const helper = data.employees.find((e) => e.id === hid);
        if (!helper) continue;
        const share = t.helper_commission / t.helper_ids.length;
        const row = map.get(helper.id) ?? { employeeId: helper.id, name: helper.name, role: "Helper", trips: 0, gross: 0, commission: 0, entries: [] };
        row.trips += 1;
        row.gross += t.gross;
        row.commission += share;
        row.entries.push({ transportify: t.transportify_id, date: t.date_time, gross: t.gross, amount: share });
        map.set(helper.id, row);
      }
    }

    return [...map.values()].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, range, sortBy]);

  const months = useMemo(() => {
    const list: string[] = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      list.push(format(d, "yyyy-MM"));
      d.setMonth(d.getMonth() - 1);
    }
    return list;
  }, []);

  const totalCommissions = rows.reduce((s, r) => s + r.commission, 0);
  const monthLabel = format(range.start, "MMMM yyyy");

  const exportCsv = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines: string[] = [];
    lines.push([
      "Employee", "Role", "Transportify ID", "Trip Date", "Gross", "Commission",
    ].map(esc).join(","));
    for (const r of rows) {
      for (const e of r.entries) {
        lines.push([
          r.name, r.role, e.transportify, format(new Date(e.date), "yyyy-MM-dd"), e.gross.toFixed(2), e.amount.toFixed(2),
        ].map(esc).join(","));
      }
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Payroll & Commissions"
        subtitle="Earnings computed from trip commission rules"
        actions={
          <Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-44">
          {months.map((m) => (
            <option key={m} value={m}>{format(new Date(`${m}-01`), "MMMM yyyy")}</option>
          ))}
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="w-44">
          <option value="commission">Sort: Commission</option>
          <option value="trips">Sort: Trips</option>
          <option value="gross">Sort: Gross</option>
        </Select>
        <div className="ml-auto rounded-xl bg-slate-800 px-4 py-2 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Total commissions · {monthLabel}</p>
          <p className="text-lg font-bold text-white">{peso(totalCommissions)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Employee</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">Trips</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">Gross Contributed</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">Commission</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.employeeId} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-800">{r.name}</td>
                  <td className="px-3 py-2.5 text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${r.role === "Driver" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}>{r.role}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm text-slate-700">{r.trips}</td>
                  <td className="px-3 py-2.5 text-right text-sm text-slate-700">{peso0(r.gross)}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-semibold text-violet-600">{peso0(r.commission)}</td>
                  <td className="px-3 py-2.5">
                    <details>
                      <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:underline">
                        View {r.entries.length} trips
                      </summary>
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50 p-2">
                        {r.entries.slice().reverse().map((e, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 px-1 py-1 text-[11px]">
                            <span className="text-slate-600">{e.transportify} · {format(new Date(e.date), "MMM d")}</span>
                            <span className="text-slate-500">gross {peso0(e.gross)}</span>
                            <span className="font-medium text-violet-600">{peso0(e.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <EmptyState icon={<Wallet className="h-8 w-8" />} title="No completed trips this month" subtitle="Commissions appear here once trips are completed." />
        )}
      </div>
    </div>
  );
}
