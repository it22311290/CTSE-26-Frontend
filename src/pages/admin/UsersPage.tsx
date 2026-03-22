import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Trash2 } from "lucide-react";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Table, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/Card";
import { PageSpinner, EmptyState } from "@/components/ui/Spinner";
import toast from "react-hot-toast";

export function AdminUsersPage() {
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: authApi.getAllUsers });

  const deleteMut = useMutation({
    mutationFn: authApi.deleteUser,
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err: any) => toast.error(err.message),
  });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    deleteMut.mutate(id);
  };

  if (isLoading) return <PageSpinner />;
  const users = data?.users ?? [];
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Users</h1>
        <p className="text-zinc-500 text-sm">{users.length} registered users</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total Users" value={users.length} />
        <MetricCard label="Customers" value={users.filter((u) => u.role === "customer").length} />
        <MetricCard label="Admins" value={users.filter((u) => u.role === "admin").length} />
      </div>

      <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white" />

      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-12 h-12" />} title="No users found" />
      ) : (
        <Table>
          <thead>
            <tr><Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th><Th><></></Th></tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const initials = u.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <Tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 flex-shrink-0">
                        {initials}
                      </div>
                      <span className="font-medium text-zinc-900">{u.name}</span>
                      {u.id === me?.id && <span className="text-xs text-zinc-400">(you)</span>}
                    </div>
                  </Td>
                  <Td><span className="text-zinc-600">{u.email}</span></Td>
                  <Td><StatusBadge status={u.role} /></Td>
                  <Td><span className="text-xs text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</span></Td>
                  <Td>
                    {u.id !== me?.id && (
                      <Button size="xs" variant="outline" className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(u.id, u.name)} loading={deleteMut.isPending}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
