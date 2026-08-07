import { useState } from "react";
import { Plus, RotateCcw, Shield, Trash2 } from "lucide-react";
import { useStore, settingsActions, ruleActions, userActions, resetData } from "../lib/store";
import { Badge, Button, Card, Field, Input, Select, cx } from "../components/ui";
import type { CommissionBasis, Role, SplitMode, User } from "../lib/types";

export function Settings() {
  const data = useStore();
  const [company, setCompany] = useState({ ...data.company });
  const [saved, setSaved] = useState(false);
  const [newType, setNewType] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const saveCompany = () => {
    settingsActions.setCompany(company);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Company Profile" subtitle="Used in exported reports and records">
          <div className="space-y-4">
            <Field label="Company Name">
              <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
            </Field>
            <Field label="Address">
              <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={saveCompany}>Save profile</Button>
              {saved && <span className="text-xs font-medium text-emerald-600">Saved ✓</span>}
            </div>
          </div>
        </Card>

        <Card title="Vehicle Types" subtitle="Configurable list used across the app">
          <div className="mb-3 flex gap-2">
            <Input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. 10-Wheeler Wingvan" />
            <Button
              variant="secondary"
              onClick={() => {
                if (newType.trim()) {
                  settingsActions.addVehicleType(newType.trim());
                  setNewType("");
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.vehicleTypes.map((v) => {
              const inUse = data.vehicles.some((veh) => veh.type === v);
              return (
                <span key={v} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                  {v}
                  {!inUse && (
                    <button
                      onClick={() => settingsActions.removeVehicleType(v)}
                      className="text-slate-400 hover:text-red-500"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Types already assigned to vehicles cannot be removed.</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CommissionRuleEditor role="driver" />
        <CommissionRuleEditor role="helper" />
      </div>

      <UserManagement />

      <Card title="Danger Zone">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800">Reset demo data</p>
            <p className="text-xs text-slate-500">Restore the seeded dataset and discard all changes.</p>
          </div>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" /> Reset data
          </Button>
        </div>
      </Card>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800">Reset all data?</h3>
            <p className="mt-1 text-sm text-slate-500">This will erase all trips, employees, vehicles and settings you've added.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => { resetData(); setConfirmReset(false); }}>Yes, reset</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommissionRuleEditor({ role }: { role: "driver" | "helper" }) {
  const data = useStore();
  const rule = data.commissionRules.find((r) => r.role === role);

  const [basis, setBasis] = useState<CommissionBasis>(rule?.basis ?? "profit");
  const [defaultPct, setDefaultPct] = useState((rule?.default_percentage ?? 0).toString());
  const [minPay, setMinPay] = useState((rule?.min_guaranteed_pay ?? 0).toString());
  const [splitMode, setSplitMode] = useState<SplitMode>(rule?.split_mode ?? "equal");
  const [typeOverride, setTypeOverride] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(rule?.vehicle_type_overrides ?? {}).map(([k, v]) => [k, String(v)]))
  );
  const [empOverride, setEmpOverride] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(rule?.employee_overrides ?? {}).map(([k, v]) => [k, String(v)]))
  );
  const [saved, setSaved] = useState(false);

  if (!rule) return null;

  const drivers = data.employees.filter((e) => e.role === "driver");

  const save = () => {
    ruleActions.update(rule.id, {
      ...rule,
      basis,
      default_percentage: parseFloat(defaultPct) || 0,
      min_guaranteed_pay: parseFloat(minPay) || 0,
      split_mode: splitMode,
      vehicle_type_overrides: Object.fromEntries(
        Object.entries(typeOverride)
          .filter(([, v]) => v !== "")
          .map(([k, v]) => [k, parseFloat(v)])
      ),
      employee_overrides: Object.fromEntries(
        Object.entries(empOverride)
          .filter(([, v]) => v !== "")
          .map(([k, v]) => [k, parseFloat(v)])
      ),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card
      title={`${role === "driver" ? "Driver" : "Helper"} Commission Rule`}
      subtitle="Evaluated per trip: employee override → vehicle type override → default %"
      actions={<Button size="sm" onClick={save}>{saved ? "Saved ✓" : "Save rule"}</Button>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Basis">
            <Select value={basis} onChange={(e) => setBasis(e.target.value as CommissionBasis)}>
              <option value="profit">% of Profit</option>
              <option value="gross">% of Gross</option>
            </Select>
          </Field>
          <Field label="Default %">
            <Input type="number" min="0" step="0.1" value={defaultPct} onChange={(e) => setDefaultPct(e.target.value)} />
          </Field>
          <Field label="Min Guaranteed (₱)">
            <Input type="number" min="0" value={minPay} onChange={(e) => setMinPay(e.target.value)} />
          </Field>
        </div>

        {role === "helper" && (
          <Field label="Split Mode">
            <Select value={splitMode} onChange={(e) => setSplitMode(e.target.value as SplitMode)}>
              <option value="equal">Split evenly</option>
              <option value="custom">Custom per trip (set on the trip)</option>
            </Select>
          </Field>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Per Vehicle Type Overrides</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.vehicleTypes.map((t) => (
              <Field key={t} label={t}>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={`default ${rule.default_percentage}`}
                  value={typeOverride[t] ?? ""}
                  onChange={(e) => setTypeOverride({ ...typeOverride, [t]: e.target.value })}
                />
              </Field>
            ))}
          </div>
        </div>

        {role === "driver" && (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">Per Employee Overrides</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {drivers.map((d) => (
                <Field key={d.id} label={d.name}>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder={`default ${rule.default_percentage}`}
                    value={empOverride[d.id] ?? ""}
                    onChange={(e) => setEmpOverride({ ...empOverride, [d.id]: e.target.value })}
                  />
                </Field>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function UserManagement() {
  const data = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [error, setError] = useState("");

  const roleLabel: Record<Role, string> = {
    owner: "Owner / Admin",
    staff: "Office Staff",
    accountant: "Accountant",
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return setError("All fields are required.");
    if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
      return setError("A user with that email already exists.");
    userActions.add({ name: name.trim(), email: email.trim(), password, role, status: "active" });
    setShowForm(false);
    setName("");
    setEmail("");
    setPassword("");
    setRole("staff");
    setError("");
  };

  const toggleUser = (u: User) => {
    if (u.role === "owner" && u.status === "active") return;
    userActions.update(u.id, { status: u.status === "active" ? "inactive" : "active" });
  };

  return (
    <Card
      title="Login Accounts"
      subtitle="Owner, office staff and accountant access only — drivers/helpers never log in"
      actions={
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      }
    >
      {showForm && (
        <form onSubmit={submit} className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {error && <div className="col-span-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="staff">Office Staff</option>
              <option value="accountant">Accountant</option>
              <option value="owner">Owner / Admin</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" className="w-full">Create</Button>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-100">
        {data.users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {u.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className={cx("truncate text-sm font-medium", u.status === "inactive" ? "text-slate-400" : "text-slate-800")}>
                {u.name}
              </p>
              <p className="truncate text-xs text-slate-400">{u.email}</p>
            </div>
            <Badge tone={u.role === "owner" ? "violet" : u.role === "accountant" ? "amber" : "blue"}>{roleLabel[u.role]}</Badge>
            <Badge tone={u.status === "active" ? "green" : "red"}>{u.status}</Badge>
            <button
              onClick={() => toggleUser(u)}
              className={cx(
                "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1",
                u.status === "active"
                  ? "text-slate-600 ring-slate-200 hover:bg-slate-50"
                  : "text-emerald-600 ring-emerald-200 hover:bg-emerald-50"
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              {u.status === "active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
