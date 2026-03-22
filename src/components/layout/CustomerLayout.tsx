import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, Package, CreditCard, LogOut, Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { clsx } from "clsx";
import toast from "react-hot-toast";

export function CustomerLayout() {
  const { user, clearAuth } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    toast.success("Signed out");
    navigate("/login");
  };

  const navLinks = [
    { to: "/shop", label: "Shop", icon: <ShoppingBag className="w-4 h-4" /> },
    { to: "/orders", label: "My Orders", icon: <Package className="w-4 h-4" /> },
    { to: "/payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
    { to: "/account", label: "Account", icon: <User className="w-4 h-4" /> },
  ];

  const isActive = (to: string) => location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Top nav */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/shop" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <span className="font-bold text-zinc-900 text-lg tracking-tight">ShopFlow</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(l.to) ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  {l.icon}
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link
                to="/cart"
                className={clsx(
                  "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive("/cart") ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-200">
                    <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-zinc-700 font-medium">{user.name.split(" ")[0]}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 hover:bg-zinc-100 rounded-lg transition-colors">
                  Sign in
                </Link>
              )}

              {/* Mobile toggle */}
              <button className="md:hidden p-2 rounded-lg hover:bg-zinc-100 text-zinc-500" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(l.to) ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
