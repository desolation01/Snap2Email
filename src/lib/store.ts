import { useSyncExternalStore } from "react";
import type {
  AppData,
  CommissionRule,
  Employee,
  ExpenseItem,
  PayrollLedgerEntry,
  Trip,
  TripStatus,
  User,
  Vehicle,
} from "./types";
import { seedData } from "./seed";
import { computeCommission } from "./commission";

const STORAGE_KEY = "trucking-ops-data-v1";

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed && Array.isArray(parsed.trips)) return parsed;
    }
  } catch {
    // fall through to seed
  }
  return seedData;
}

let state: AppData = load();
const listeners = new Set<() => void>();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

function recomputeLedger() {
  const ledger: PayrollLedgerEntry[] = [];
  for (const t of state.trips) {
    const driverEntry = t.driver_commission > 0
      ? {
          id: `led-${t.id}-d`,
          employee_id: t.driver_id,
          trip_id: t.id,
          amount: t.driver_commission,
          basis_used: "profit" as const,
          basis_amount: t.profit,
          percentage: 0,
          date: t.date_time,
        }
      : null;
    if (driverEntry) ledger.push(driverEntry);
    for (const h of t.helper_ids) {
      const share = t.helper_ids.length > 1 ? t.helper_commission / t.helper_ids.length : t.helper_commission;
      ledger.push({
        id: `led-${t.id}-h-${h}`,
        employee_id: h,
        trip_id: t.id,
        amount: Math.round(share * 100) / 100,
        basis_used: "profit",
        basis_amount: t.profit,
        percentage: 0,
        date: t.date_time,
      });
    }
  }
  state.payrollLedger = ledger;
}

function apply(next: AppData) {
  state = next;
  recomputeLedger();
  emit();
}

function mutate(fn: (draft: AppData) => void) {
  const next: AppData = {
    ...state,
    users: [...state.users],
    employees: [...state.employees],
    vehicles: [...state.vehicles],
    trips: [...state.trips],
    commissionRules: [...state.commissionRules],
    payrollLedger: [...state.payrollLedger],
    customers: [...state.customers],
    vehicleTypes: [...state.vehicleTypes],
    company: { ...state.company },
  };
  fn(next);
  apply(next);
}

// ---------- Auth ----------
export const auth = {
  login(email: string, password: string): User | null {
    const user = state.users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.status === "active"
    );
    return user ?? null;
  },
};

// ---------- Trips ----------
export interface TripInput {
  driver_id: string;
  helper_ids: string[];
  vehicle_id: string;
  transportify_id: string;
  cargo_weight?: number;
  cargo_dimensions?: string;
  customer_phone: string;
  customer_name?: string;
  pickup_address: string;
  dropoff_address: string;
  items?: string;
  description?: string;
  gross: number;
  expense_items: ExpenseItem[];
  helper_split: Trip["helper_split"];
  helper_split_custom: Record<string, number>;
  date_time: string;
  status: TripStatus;
}

export const tripActions = {
  add(input: TripInput, userId: string): Trip {
    const vehicle = state.vehicles.find((v) => v.id === input.vehicle_id);
    const driver = state.employees.find((e) => e.id === input.driver_id);
    const nowIso = new Date().toISOString();

    const driverComm = computeCommission(
      {
        role: "driver",
        employeeIds: driver ? [driver.id] : [],
        vehicleType: vehicle?.type ?? "",
        gross: input.gross,
        expenseItems: input.expense_items,
        status: input.status,
      },
      state
    );
    const helperComm = computeCommission(
      {
        role: "helper",
        employeeIds: input.helper_ids,
        vehicleType: vehicle?.type ?? "",
        gross: input.gross,
        expenseItems: input.expense_items,
        status: input.status,
        split: input.helper_split,
        splitCustom: input.helper_split_custom,
      },
      state
    );

    const totalExpense = input.expense_items.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const trip: Trip = {
      id: uid(),
      driver_id: input.driver_id,
      helper_ids: input.helper_ids,
      vehicle_id: input.vehicle_id,
      transportify_id: input.transportify_id,
      cargo_weight: input.cargo_weight,
      cargo_dimensions: input.cargo_dimensions,
      customer_phone: input.customer_phone,
      customer_name: input.customer_name,
      pickup_address: input.pickup_address,
      dropoff_address: input.dropoff_address,
      items: input.items,
      description: input.description,
      images: [],
      gross: Number(input.gross) || 0,
      expense_items: input.expense_items,
      total_expense: totalExpense,
      profit: (Number(input.gross) || 0) - totalExpense,
      driver_commission: Math.round(driverComm.total * 100) / 100,
      helper_commission: Math.round(helperComm.total * 100) / 100,
      helper_split: input.helper_split,
      helper_split_custom: input.helper_split_custom,
      date_time: input.date_time,
      status: input.status,
      created_by: userId,
      created_at: nowIso,
      updated_at: nowIso,
    };

    mutate((draft) => {
      draft.trips = [trip, ...draft.trips];
      upsertCustomer(draft, input);
    });
    return trip;
  },

  update(id: string, input: TripInput, _userId: string) {
    const existing = state.trips.find((t) => t.id === id);
    if (!existing) return;
    const vehicle = state.vehicles.find((v) => v.id === input.vehicle_id);
    const driver = state.employees.find((e) => e.id === input.driver_id);

    const driverComm = computeCommission(
      {
        role: "driver",
        employeeIds: driver ? [driver.id] : [],
        vehicleType: vehicle?.type ?? "",
        gross: input.gross,
        expenseItems: input.expense_items,
        status: input.status,
      },
      state
    );
    const helperComm = computeCommission(
      {
        role: "helper",
        employeeIds: input.helper_ids,
        vehicleType: vehicle?.type ?? "",
        gross: input.gross,
        expenseItems: input.expense_items,
        status: input.status,
        split: input.helper_split,
        splitCustom: input.helper_split_custom,
      },
      state
    );

    const totalExpense = input.expense_items.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    mutate((draft) => {
      draft.trips = draft.trips.map((t) =>
        t.id === id
          ? {
              ...t,
              ...input,
              gross: Number(input.gross) || 0,
              total_expense: totalExpense,
              profit: (Number(input.gross) || 0) - totalExpense,
              driver_commission: Math.round(driverComm.total * 100) / 100,
              helper_commission: Math.round(helperComm.total * 100) / 100,
              updated_at: new Date().toISOString(),
            }
          : t
      );
      upsertCustomer(draft, input);
    });
  },

  remove(id: string) {
    mutate((draft) => {
      draft.trips = draft.trips.filter((t) => t.id !== id);
    });
  },
};

function upsertCustomer(draft: AppData, input: TripInput) {
  const existing = draft.customers.find(
    (c) => c.phone_number === input.customer_phone
  );
  if (!existing && input.customer_phone) {
    draft.customers.push({
      id: uid(),
      phone_number: input.customer_phone,
      name: input.customer_name || undefined,
      created_at: new Date().toISOString(),
    });
  } else if (existing && input.customer_name && !existing.name) {
    existing.name = input.customer_name;
  }
}

// ---------- Employees ----------
export const employeeActions = {
  add(emp: Omit<Employee, "id" | "created_at">) {
    mutate((draft) => {
      draft.employees.push({ ...emp, id: uid(), created_at: new Date().toISOString() });
    });
  },
  update(id: string, emp: Partial<Employee>) {
    mutate((draft) => {
      draft.employees = draft.employees.map((e) => (e.id === id ? { ...e, ...emp } : e));
    });
  },
  remove(id: string) {
    mutate((draft) => {
      draft.employees = draft.employees.filter((e) => e.id !== id);
    });
  },
};

// ---------- Vehicles ----------
export const vehicleActions = {
  add(veh: Omit<Vehicle, "id" | "created_at">) {
    mutate((draft) => {
      draft.vehicles.push({ ...veh, id: uid(), created_at: new Date().toISOString() });
    });
  },
  update(id: string, veh: Partial<Vehicle>) {
    mutate((draft) => {
      draft.vehicles = draft.vehicles.map((v) => (v.id === id ? { ...v, ...veh } : v));
    });
  },
  remove(id: string) {
    mutate((draft) => {
      draft.vehicles = draft.vehicles.filter((v) => v.id !== id);
    });
  },
};

// ---------- Users ----------
export const userActions = {
  add(user: Omit<User, "id" | "created_at">) {
    mutate((draft) => {
      draft.users.push({ ...user, id: uid(), created_at: new Date().toISOString() });
    });
  },
  update(id: string, user: Partial<User>) {
    mutate((draft) => {
      draft.users = draft.users.map((u) => (u.id === id ? { ...u, ...user } : u));
    });
  },
  remove(id: string) {
    mutate((draft) => {
      draft.users = draft.users.filter((u) => u.id !== id);
    });
  },
};

// ---------- Commission rules ----------
export const ruleActions = {
  update(id: string, rule: CommissionRule) {
    mutate((draft) => {
      draft.commissionRules = draft.commissionRules.map((r) =>
        r.id === id ? { ...rule, updated_at: new Date().toISOString() } : r
      );
    });
  },
};

// ---------- Settings ----------
export const settingsActions = {
  setCompany(company: AppData["company"]) {
    mutate((draft) => {
      draft.company = { ...company };
    });
  },
  addVehicleType(type: string) {
    mutate((draft) => {
      if (!draft.vehicleTypes.includes(type)) draft.vehicleTypes.push(type);
    });
  },
  removeVehicleType(type: string) {
    mutate((draft) => {
      draft.vehicleTypes = draft.vehicleTypes.filter((t) => t !== type);
    });
  },
};

// ---------- Reset ----------
export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  state = seedData;
  emit();
};

// ---------- Hook ----------
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStore(): AppData {
  return useSyncExternalStore(subscribe, () => state);
}

export { state as storeData };
