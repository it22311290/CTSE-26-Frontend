import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" as "customer" | "admin" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/shop";

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "register" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    if (mode === "register" && form.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await authApi.login(form.email, form.password);
      } else {
        result = await authApi.register(form.name, form.email, form.password, form.role);
      }
      setAuth(result.user, result.token);
      toast.success(`Welcome${result.user.name ? `, ${result.user.name.split(" ")[0]}` : ""}!`);
      navigate(result.user.role === "admin" ? "/admin/dashboard" : from, { replace: true });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">ShopFlow</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-zinc-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setErrors({}); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "login" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >Sign In</button>
          <button
            onClick={() => { setMode("register"); setErrors({}); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "register" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >Create Account</button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Input label="Full Name" placeholder="John Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            )}
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <Input label="Password" type="password" placeholder={mode === "register" ? "Min. 8 characters" : "Your password"}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
            {mode === "register" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700">Account Type</label>
                <div className="flex gap-3">
                  {(["customer", "admin"] as const).map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="role" value={r} checked={form.role === r}
                        onChange={() => setForm({ ...form, role: r })}
                        className="w-4 h-4 accent-zinc-900" />
                      <span className="text-sm text-zinc-700 capitalize">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErrors({}); }}
            className="text-zinc-900 font-semibold hover:underline">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
