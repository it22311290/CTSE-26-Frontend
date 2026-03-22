import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { productsApi, type ProductPayload } from "@/api/products";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Table, Th, Td, Tr } from "@/components/ui/Table";
import { PageSpinner, EmptyState } from "@/components/ui/Spinner";
import { MetricCard } from "@/components/ui/Card";
import type { Product } from "@/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";

const CATEGORIES = ["Electronics","Sports","Kitchen","Clothing","Books","Toys","Health","Home","Beauty","Food"];

function ProductForm({ product, onClose }: { product?: Product; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!product;
  const [form, setForm] = useState<ProductPayload>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    category: product?.category ?? "Electronics",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (form.price <= 0) e.price = "Must be > 0";
    if (form.stock < 0) e.stock = "Must be ≥ 0";
    if (!form.category) e.category = "Required";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: isEdit ? (p: ProductPayload) => productsApi.update(product!.id, p) : productsApi.create,
    onSuccess: () => {
      toast.success(isEdit ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="e.g. Wireless Headphones" />
      <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief product description" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Price ($)" type="number" step="0.01" min="0" value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} error={errors.price} />
        <Input label="Stock" type="number" min="0" value={form.stock}
          onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} error={errors.stock} />
      </div>
      <Select label="Category" value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        options={CATEGORIES.map((c) => ({ value: c, label: c }))} error={errors.category} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} fullWidth>Cancel</Button>
        <Button type="submit" loading={mutation.isPending} fullWidth>
          {isEdit ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}

export function AdminProductsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => productsApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => { toast.success("Product deleted"); qc.invalidateQueries({ queryKey: ["admin-products"] }); },
    onError: (err: any) => toast.error(err.message),
  });

  const handleDelete = (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    deleteMutation.mutate(p.id);
  };

  const products = (data?.products ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Products</h1>
          <p className="text-zinc-500 text-sm">{data?.count ?? 0} products</p>
        </div>
        <Button onClick={() => setModal({ open: true })}><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total" value={data?.count ?? 0} />
        <MetricCard label="In Stock" value={data?.products.filter((p) => p.stock > 0).length ?? 0} />
        <MetricCard label="Out of Stock" value={data?.products.filter((p) => p.stock === 0).length ?? 0} />
        <MetricCard label="Low Stock" value={data?.products.filter((p) => p.stock > 0 && p.stock < 10).length ?? 0} />
      </div>

      <div className="flex gap-3">
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white" />
      </div>

      {products.length === 0 ? (
        <EmptyState icon={<Package className="w-12 h-12" />} title="No products" action={<Button onClick={() => setModal({ open: true })}>Add First Product</Button>} />
      ) : (
        <Table>
          <thead>
            <tr><Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <div>
                    <p className="font-medium text-zinc-900">{p.name}</p>
                    <p className="text-xs text-zinc-400 truncate max-w-xs">{p.description || "—"}</p>
                  </div>
                </Td>
                <Td><span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-mono">{p.category}</span></Td>
                <Td><span className="font-mono font-semibold">${p.price.toFixed(2)}</span></Td>
                <Td>
                  <span className={clsx("text-sm font-semibold", p.stock === 0 ? "text-red-600" : p.stock < 10 ? "text-amber-600" : "text-emerald-600")}>
                    {p.stock}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button size="xs" variant="outline" onClick={() => setModal({ open: true, product: p })}><Pencil className="w-3 h-3" /></Button>
                    <Button size="xs" variant="outline" onClick={() => handleDelete(p)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.product ? "Edit Product" : "Add Product"}>
        <ProductForm product={modal.product} onClose={() => setModal({ open: false })} />
      </Modal>
    </div>
  );
}
