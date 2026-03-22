import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  LogOut, Settings, ChevronRight, BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { clsx } from "clsx";
import toast from "react-hot-toast";

const navSections = [
  {
    label: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Manage",
    items: [
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { to: "/admin/payments", label: "Payments", icon: CreditCard },
      { to: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

export function AdminLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex font-sans bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-60 bg-zinc-950 flex flex-col flex-shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-zinc-900 text-sm font-bold">S</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">ShopFlow</p>
              <p className="text-zinc-500 text-xs mt-0.5">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-2">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-white text-zinc-900"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      )
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-zinc-800 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {user?.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-900 font-medium capitalize">
              {window.location.pathname.split("/admin/")[1]?.replace(/-/g, " ") || "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono bg-zinc-100 px-2 py-1 rounded">
              {user?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
