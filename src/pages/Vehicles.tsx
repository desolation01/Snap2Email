import { useState } from "react";
import { Car, Pencil, Plus, Trash2 } from "lucide-react";
import { useStore, vehicleActions } from "../lib/store";
import { Badge, Button, EmptyState, Field, Input, Modal, PageHeader, Select } from "../components/ui";
import { peso0 } from "../lib/format";
import type { Vehicle } from "../lib/types";

export function Vehicles() {
  const data = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<Vehicle | undefined>(undefined);

  const statsFor = (id: string) => {
    const trips = data.trips.filter((t) => t.vehicle_id === id);
    const gross = trips.reduce((s, t) => s + t.gross, 0);
    return { trips: trips.length, gross };
  };

  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle={`${data.vehicles.length} units in fleet`}
        actions={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.vehicles.map((v) => {
          const stats = statsFor(v.id);
          return (
            <div key={v.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{v.plate_number}</p>
                    <p className="text-xs text-slate-500">{v.type}</p>
                  </div>
                </div>
                <Badge tone={v.status === "active" ? "green" : "red"}>{v.status}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">Capacity: <strong className="text-slate-700">{v.capacity_kg.toLocaleString()} kg</strong></span>
                <span className="text-slate-500">{stats.trips} trips · <strong className="text-slate-700">{peso0(stats.gross)}</strong></span>
              </div>
              <div className="mt-3 flex justify-end gap-1">
                <button onClick={() => { setEditing(v); setFormOpen(true); }} className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => setConfirmDelete(v)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {data.vehicles.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white"><EmptyState title="No vehicles" subtitle="Add your fleet vehicles to start logging trips." /></div>
      )}

      <VehicleForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800">Delete vehicle?</h3>
            <p className="mt-1 text-sm text-slate-500">Remove {confirmDelete.plate_number}?</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(undefined)}>Cancel</Button>
              <Button variant="danger" onClick={() => { vehicleActions.remove(confirmDelete.id); setConfirmDelete(undefined); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Vehicle;
}) {
  const data = useStore();
  const [plate, setPlate] = useState(initial?.plate_number ?? "");
  const [type, setType] = useState(initial?.type ?? data.vehicleTypes[0] ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity_kg?.toString() ?? "");
  const [status, setStatus] = useState<"active" | "inactive">(initial?.status ?? "active");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) return setError("Plate number is required.");
    if (!type) return setError("Vehicle type is required.");
    const payload = {
      plate_number: plate.trim().toUpperCase(),
      type,
      capacity_kg: parseFloat(capacity) || 0,
      status: status as "active" | "inactive",
    };
    if (initial) vehicleActions.update(initial.id, payload);
    else vehicleActions.add(payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Vehicle" : "Add Vehicle"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="veh-form">Save</Button>
        </>
      }
    >
      <form id="veh-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {error && <div className="col-span-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        <Field label="Plate Number" required>
          <Input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="ABC 1234" />
        </Field>
        <Field label="Vehicle Type" required>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {data.vehicleTypes.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="Capacity (kg)">
          <Input type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
