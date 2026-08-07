import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useStore, employeeActions } from "../lib/store";
import { Badge, Button, EmptyState, Field, Input, Modal, PageHeader, Select, Td, Th, cx } from "../components/ui";
import { fmtDate, peso0 } from "../lib/format";
import type { Employee, EmployeeRole } from "../lib/types";

const roleLabels: Record<EmployeeRole, string> = {
  driver: "Driver",
  helper: "Helper",
  staff: "Office Staff",
};

export function Employees() {
  const data = useStore();
  const [tab, setTab] = useState<EmployeeRole | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>(undefined);
  const [viewing, setViewing] = useState<Employee | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<Employee | undefined>(undefined);

  const employees = data.employees.filter((e) => tab === "all" || e.role === tab);

  const tripsFor = (id: string) => data.trips.filter((t) => t.driver_id === id || t.helper_ids.includes(id));

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${data.employees.length} records`}
        actions={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["all", "driver", "helper", "staff"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setTab(r)}
            className={cx(
              "rounded-lg px-3 py-1.5 text-xs font-medium capitalize",
              tab === r ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            )}
          >
            {r === "all" ? "All" : roleLabels[r]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Contact</Th>
                <Th>License No.</Th>
                <Th>Hire Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <Td>
                    <button onClick={() => setViewing(e)} className="font-medium text-blue-600 hover:underline">
                      {e.name}
                    </button>
                  </Td>
                  <Td><Badge tone={e.role === "driver" ? "blue" : e.role === "helper" ? "violet" : "slate"}>{roleLabels[e.role]}</Badge></Td>
                  <Td>{e.contact}</Td>
                  <Td className="text-slate-500">{e.license_no ?? "—"}</Td>
                  <Td>{fmtDate(e.hire_date)}</Td>
                  <Td>
                    <Badge tone={e.status === "active" ? "green" : "red"}>{e.status}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(e); setFormOpen(true); }} className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(e)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {employees.length === 0 && <EmptyState title="No employees" subtitle="Add an employee record to get started." />}
      </div>

      <EmployeeForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />

      {viewing && (
        <Modal open onClose={() => setViewing(undefined)} title={viewing.name} wide>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Info label="Role" value={roleLabels[viewing.role]} />
            <Info label="Contact" value={viewing.contact} />
            <Info label="License" value={viewing.license_no ?? "—"} />
            <Info label="Hired" value={fmtDate(viewing.hire_date)} />
          </div>
          {viewing.commission_override != null && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Commission override: {viewing.commission_override}%
            </p>
          )}
          <h4 className="mb-2 text-sm font-semibold text-slate-700">Trip History ({tripsFor(viewing.id).length})</h4>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Date</Th>
                  <Th>Transportify</Th>
                  <Th>Gross</Th>
                  <Th>Profit</Th>
                  <Th>Commission</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tripsFor(viewing.id)
                  .sort((a, b) => b.date_time.localeCompare(a.date_time))
                  .slice(0, 50)
                  .map((t) => {
                    const isDriver = t.driver_id === viewing.id;
                    const commission = isDriver ? t.driver_commission : t.helper_commission / (t.helper_ids.length || 1);
                    return (
                      <tr key={t.id}>
                        <Td>{fmtDate(t.date_time)}</Td>
                        <Td className="text-blue-600">{t.transportify_id}</Td>
                        <Td>{peso0(t.gross)}</Td>
                        <Td className={cx("font-medium", t.gross - t.total_expense >= 0 ? "text-emerald-600" : "text-red-600")}>{peso0(t.gross - t.total_expense)}</Td>
                        <Td className="text-violet-600">{peso0(commission)}</Td>
                        <Td><Badge tone={t.status === "completed" ? "green" : t.status === "cancelled" ? "red" : t.status === "scheduled" ? "blue" : "amber"}>{t.status}</Badge></Td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800">Delete employee?</h3>
            <p className="mt-1 text-sm text-slate-500">{confirmDelete.name} will be removed.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(undefined)}>Cancel</Button>
              <Button variant="danger" onClick={() => { employeeActions.remove(confirmDelete.id); setConfirmDelete(undefined); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function EmployeeForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Employee;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState<EmployeeRole>(initial?.role ?? "driver");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [license, setLicense] = useState(initial?.license_no ?? "");
  const [hireDate, setHireDate] = useState(() => {
    if (initial?.hire_date) return initial.hire_date.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<"active" | "inactive">(initial?.status ?? "active");
  const [override, setOverride] = useState(initial?.commission_override?.toString() ?? "");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required.");
    if (!contact.trim()) return setError("Contact info is required.");
    if (role === "driver" && !license.trim()) return setError("License number is required for drivers.");

    const payload = {
      name: name.trim(),
      role,
      contact: contact.trim(),
      license_no: role === "driver" ? license.trim() : undefined,
      hire_date: new Date(hireDate).toISOString(),
      status: status as "active" | "inactive",
      commission_override: override ? parseFloat(override) : null,
    };

    if (initial) employeeActions.update(initial.id, payload);
    else employeeActions.add(payload as any);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Employee" : "Add Employee"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="emp-form">Save</Button>
        </>
      }
    >
      <form id="emp-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {error && <div className="col-span-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        <Field label="Full Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Role" required>
          <Select value={role} onChange={(e) => setRole(e.target.value as EmployeeRole)}>
            <option value="driver">Driver</option>
            <option value="helper">Helper</option>
            <option value="staff">Office Staff</option>
          </Select>
        </Field>
        <Field label="Contact Info" required>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone number" />
        </Field>
        {role === "driver" && (
          <Field label="License Number" required>
            <Input value={license} onChange={(e) => setLicense(e.target.value)} />
          </Field>
        )}
        <Field label="Hire Date" required>
          <Input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
        <Field label="Commission Override (%)" hint="Optional — overrides vehicle type and default %" className="sm:col-span-2">
          <Input type="number" min="0" step="0.1" value={override} onChange={(e) => setOverride(e.target.value)} placeholder="Leave blank for default rule" />
        </Field>
      </form>
    </Modal>
  );
}
