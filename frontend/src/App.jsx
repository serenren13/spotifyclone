import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      {!isLandingPage && <Sidebar />}
      <main className={`transition-all duration-300 ${!isLandingPage ? 'pl-0 pb-16 md:pl-16 md:pb-0' : ''}`}>
        <Outlet />
      </main>
    </>
  );
}