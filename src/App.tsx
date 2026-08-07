import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./lib/auth";
import { Login } from "./pages/Login";
import { Layout, type PageKey } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Trips } from "./pages/Trips";
import { CalendarPage } from "./pages/Calendar";
import { Employees } from "./pages/Employees";
import { Vehicles } from "./pages/Vehicles";
import { Customers } from "./pages/Customers";
import { Payroll } from "./pages/Payroll";
import { Settings } from "./pages/Settings";

const validPages: PageKey[] = [
  "dashboard",
  "trips",
  "calendar",
  "employees",
  "vehicles",
  "customers",
  "payroll",
  "settings",
];

function hashPage(): PageKey {
  const h = window.location.hash.replace(/^#\/?/, "");
  return (validPages.includes(h as PageKey) ? h : "dashboard") as PageKey;
}

function Shell() {
  const { user } = useAuth();
  const [page, setPage] = useState<PageKey>(hashPage);

  useEffect(() => {
    const onHash = () => setPage(hashPage());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (p: PageKey) => {
    window.location.hash = `/${p}`;
    setPage(p);
  };

  if (!user) return <Login />;

  return (
    <Layout page={page} onNavigate={navigate}>
      {page === "dashboard" && <Dashboard onNavigate={navigate} />}
      {page === "trips" && <Trips />}
      {page === "calendar" && <CalendarPage />}
      {page === "employees" && <Employees />}
      {page === "vehicles" && <Vehicles />}
      {page === "customers" && <Customers />}
      {page === "payroll" && <Payroll />}
      {page === "settings" && <Settings />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
