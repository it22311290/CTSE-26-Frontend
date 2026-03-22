import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

export function AccountPage() {
  const { user, setAuth, token } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setLoading(true);
    try {
      const { user: updated } = await authApi.updateProfile(name);
      setAuth(updated, token!);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Account</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white rounded-2xl border border-zinc-200">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-bold text-zinc-900 text-lg">{user.name}</p>
          <p className="text-zinc-500 text-sm">{user.email}</p>
          <div className="mt-1"><StatusBadge status={user.role} /></div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900">Edit Profile</h2>
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={user.email} disabled hint="Email cannot be changed" />
        <Input label="Role" value={user.role} disabled />
        <Button onClick={handleSave} loading={loading}>Save Changes</Button>
      </div>

      {/* Member since */}
      <p className="text-xs text-zinc-400 text-center mt-4">
        Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
