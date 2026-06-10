import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { StaffDashboard } from "./components/StaffDashboard";

/* MARKER-MAKE-KIT-INVOKED */

type Page = "landing" | "auth" | "customer" | "staff";
type UserRole = "customer" | "staff";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [userName, setUserName] = useState("");

  const handleLogin = (role: UserRole, name: string) => {
    setUserName(name);
    setPage(role === "customer" ? "customer" : "staff");
  };

  const handleLogout = () => {
    setUserName("");
    setPage("landing");
  };

  return (
    <>
      {page === "landing" && (
        <LandingPage onGetStarted={() => setPage("auth")} />
      )}
      {page === "auth" && (
        <AuthPage onBack={() => setPage("landing")} onLogin={handleLogin} />
      )}
      {page === "customer" && (
        <CustomerDashboard userName={userName} onLogout={handleLogout} />
      )}
      {page === "staff" && (
        <StaffDashboard userName={userName} onLogout={handleLogout} />
      )}
    </>
  );
}
