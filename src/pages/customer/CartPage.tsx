import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ordersApi } from "@/api/orders";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/Spinner";
import toast from "react-hot-toast";

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: "", city: "", country: "" });
  const [method, setMethod] = useState<"card" | "paypal" | "bank_transfer">("card");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sub = subtotal();
  const tax = sub * 0.1;
  const total = sub + tax;

  const validateAddress = () => {
    const e: Record<string, string> = {};
    if (!address.street.trim()) e.street = "Street is required";
    if (!address.city.trim()) e.city = "City is required";
    if (!address.country.trim()) e.country = "Country is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate("/login"); return; }
    if (!validateAddress()) return;
    setLoading(true);
    try {
      const { order } = await ordersApi.create({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingAddress: address,
      });
      clearCart();
      toast.success(`Order ${order.orderNumber} placed successfully!`);
      navigate("/orders");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="w-16 h-16" />}
        title="Your cart is empty"
        description="Browse our products and add something you love"
        action={<Button onClick={() => navigate("/shop")}>Continue Shopping</Button>}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">
        {step === "cart" ? "Your Cart" : "Checkout"}
      </h1>

   <h1> test </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: items or address */}
        <div className="lg:col-span-2 space-y-3">
          {step === "cart" ? (
            <>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="bg-white rounded-2xl border border-zinc-200 p-4 flex gap-4">
                  <div className="w-20 h-20 bg-zinc-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {({ Electronics: "⚡", Sports: "🏃", Kitchen: "☕", Clothing: "👕", Books: "📚" } as any)[product.category] || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900">{product.name}</p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{product.category}</p>
                    <p className="text-sm font-bold text-zinc-900 font-mono mt-1">${product.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button onClick={() => removeItem(product.id)} className="p-1 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, Math.min(quantity + 1, product.stock))}
                        disabled={quantity >= product.stock}
                        className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-40">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold font-mono">${(product.price * quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => { if (confirm("Clear cart?")) clearCart(); }}
                className="text-xs text-red-500 hover:text-red-700 mt-2">Clear cart</button>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
              <h2 className="font-semibold text-zinc-900">Shipping Address</h2>
              <Input label="Street Address" placeholder="123 Main Street"
                value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                error={errors.street} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="Colombo"
                  value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  error={errors.city} />
                <Input label="Country" placeholder="LK"
                  value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  error={errors.country} />
              </div>
              <div className="border-t border-zinc-100 pt-4">
                <h2 className="font-semibold text-zinc-900 mb-3">Payment Method</h2>
                <div className="space-y-2">
                  {([
                    { value: "card", label: "💳 Credit / Debit Card" },
                    { value: "paypal", label: "🅿️ PayPal" },
                    { value: "bank_transfer", label: "🏦 Bank Transfer" },
                  ] as const).map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${method === opt.value ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"}`}>
                      <input type="radio" name="method" value={opt.value} checked={method === opt.value}
                        onChange={() => setMethod(opt.value)} className="accent-zinc-900" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="font-semibold text-zinc-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between text-zinc-600">
                  <span className="truncate max-w-[160px]">{i.product.name} ×{i.quantity}</span>
                  <span className="font-mono">${(i.product.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-zinc-100 pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span><span className="font-mono">${sub.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Tax (10%)</span><span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 text-base border-t border-zinc-100 pt-2 mt-2">
                  <span>Total</span><span className="font-mono">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {step === "cart" ? (
              <Button fullWidth size="lg" className="mt-5" onClick={() => {
                if (!user) { navigate("/login"); return; }
                setStep("checkout");
              }}>
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="space-y-2 mt-5">
                <Button fullWidth size="lg" onClick={handlePlaceOrder} loading={loading}>
                  Place Order · ${total.toFixed(2)}
                </Button>
                <Button fullWidth size="sm" variant="ghost" onClick={() => setStep("cart")}>
                  ← Back to Cart
                </Button>
              </div>
            )}
          </div>

          {step === "checkout" && (
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Items</h3>
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between text-xs text-zinc-600 py-1">
                  <span className="truncate max-w-[160px]">{i.product.name}</span>
                  <span>×{i.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
