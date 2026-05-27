import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import Sidebar from "./components/Sidebar";

export default function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
        {!isLandingPage && <Sidebar />}

        <main className={`transition-all duration-300 ${!isLandingPage ? 'pl-16' : ''}`}>
          <Outlet />
        </main>
    </>
  );
}