import { useState, type ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  Car,
  LayoutDashboard,
  LogOut,
  Settings,
  Truck,
  Users,
  Wallet,
  Users2,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { cx } from "./ui";

export type PageKey =
  | "dashboard"
  | "trips"
  | "calendar"
  | "employees"
  | "vehicles"
  | "customers"
  | "payroll"
  | "settings";

const navItems: Array<{
  key: PageKey;
  label: string;
  icon: ReactNode;
  roles: Array<"owner" | "staff" | "accountant">;
}> = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["owner", "staff", "accountant"] },
  { key: "trips", label: "Trips", icon: <Truck className="h-4 w-4" />, roles: ["owner", "staff"] },
  { key: "calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" />, roles: ["owner", "staff"] },
  { key: "employees", label: "Employees", icon: <Users className="h-4 w-4" />, roles: ["owner", "staff"] },
  { key: "vehicles", label: "Vehicles", icon: <Car className="h-4 w-4" />, roles: ["owner", "staff"] },
  { key: "customers", label: "Customers", icon: <Users2 className="h-4 w-4" />, roles: ["owner", "staff"] },
  { key: "payroll", label: "Payroll", icon: <Wallet className="h-4 w-4" />, roles: ["owner", "accountant"] },
  { key: "settings", label: "Settings", icon: <Settings className="h-4 w-4" />, roles: ["owner"] },
];

const titles: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Financial overview of your operations" },
  trips: { title: "Trips", subtitle: "Log and manage all Transportify bookings" },
  calendar: { title: "Operations Calendar", subtitle: "Trip and profit overview by day" },
  employees: { title: "Employees", subtitle: "Drivers, helpers and office staff" },
  vehicles: { title: "Vehicles", subtitle: "Company fleet" },
  customers: { title: "Customers", subtitle: "Auto-tracked from trip phone numbers" },
  payroll: { title: "Payroll & Commissions", subtitle: "Driver and helper earnings by period" },
  settings: { title: "Settings", subtitle: "Company profile, vehicle types, commission rules" },
};

export function Layout({
  page,
  onNavigate,
  children,
}: {
  page: PageKey;
  onNavigate: (p: PageKey) => void;
  children: ReactNode;
}) {
  const { user, logout, can } = useAuth();
  const [open, setOpen] = useState(false);

  const items = navItems.filter((i) => can(...i.roles));

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">FastHaul Ops</p>
          <p className="text-[11px] text-slate-400">Trucking Management</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              onNavigate(item.key);
              setOpen(false);
            }}
            className={cx(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              page === item.key
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
            {user?.name?.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-slate-400">
              {user?.role === "owner" ? "Owner / Admin" : user?.role === "staff" ? "Office Staff" : "Accountant"}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      <aside className="hidden w-60 shrink-0 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-slate-800">{titles[page].title}</p>
          <button onClick={logout} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
