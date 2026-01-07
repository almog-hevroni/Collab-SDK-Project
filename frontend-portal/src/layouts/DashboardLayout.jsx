import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Plus, Server } from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    {
      name: "My Apps",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    // Future: { name: "Analytics", path: "/analytics", icon: <BarChart size={20} /> },
    // Future: { name: "Billing", path: "/billing", icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col z-10">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            CS
          </div>
          <span className="font-bold text-xl text-secondary">CollabSDK</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-gray-600 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t bg-slate-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-secondary truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
