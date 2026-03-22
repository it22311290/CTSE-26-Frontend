import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, ShoppingCart, Star, Tag } from "lucide-react";
import { productsApi } from "@/api/products";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageSpinner, EmptyState } from "@/components/ui/Spinner";
import type { Product } from "@/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All", "Electronics", "Sports", "Kitchen", "Clothing", "Books", "Toys", "Health", "Home", "Beauty", "Food"];

const CATEGORY_EMOJI: Record<string, string> = {
  Electronics: "⚡", Sports: "🏃", Kitchen: "☕", Clothing: "👕",
  Books: "📚", Toys: "🎮", Health: "💊", Home: "🏠", Beauty: "✨", Food: "🍎",
};

export function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState<{ search?: string; category?: string; minPrice?: number; maxPrice?: number }>({});

  const { data, isLoading } = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: () => productsApi.getAll(searchQuery),
  });

  const { addItem, items } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = useCallback(() => {
    setSearchQuery({
      ...(search && { search }),
      ...(category !== "All" && { category }),
      ...(minPrice && { minPrice: parseFloat(minPrice) }),
      ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
    });
  }, [search, category, minPrice, maxPrice]);

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    setSearchQuery({
      ...(search && { search }),
      ...(cat !== "All" && { category: cat }),
      ...(minPrice && { minPrice: parseFloat(minPrice) }),
      ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
    });
  };

  const cartQty = (productId: string) => items.find((i) => i.product.id === productId)?.quantity ?? 0;

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/login");
      return;
    }
    if (product.stock === 0) { toast.error("Out of stock"); return; }
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 text-center py-10 bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-3xl text-white">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Discover Products</h1>
        <p className="text-zinc-400 text-lg">Find everything you need, delivered fast</p>
        <div className="mt-6 max-w-xl mx-auto flex gap-2 px-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text" placeholder="Search products..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-zinc-500 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
          </div>
          <Button onClick={handleSearch} size="md" className="bg-white text-zinc-900 hover:bg-zinc-100 px-6">
            Search
          </Button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={clsx(
              "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
              category === cat
                ? "bg-zinc-900 text-white shadow-md"
                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
            )}
          >
            {cat !== "All" && <span>{CATEGORY_EMOJI[cat] || "📦"}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="flex items-center gap-3 mb-6 bg-white border border-zinc-200 rounded-xl p-3">
        <Filter className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        <span className="text-sm text-zinc-500 font-medium">Price:</span>
        <input type="number" placeholder="Min $" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
          className="w-24 px-2 py-1 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
        <span className="text-zinc-400">–</span>
        <input type="number" placeholder="Max $" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
          className="w-24 px-2 py-1 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
        <Button size="sm" variant="secondary" onClick={handleSearch}>Apply</Button>
        {(minPrice || maxPrice || category !== "All" || search) && (
          <Button size="sm" variant="ghost" onClick={() => {
            setSearch(""); setCategory("All"); setMinPrice(""); setMaxPrice(""); setSearchQuery({});
          }}>Clear</Button>
        )}
        <span className="ml-auto text-sm text-zinc-400">{data?.count ?? 0} products</span>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <PageSpinner />
      ) : !data?.products.length ? (
        <EmptyState icon={<Search className="w-12 h-12" />} title="No products found" description="Try adjusting your search or filters" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data.products.map((product) => {
            const inCartQty = cartQty(product.id);
            return (
              <div key={product.id} className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-5xl border-b border-zinc-100">
                  {CATEGORY_EMOJI[product.category] || "📦"}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-mono">
                      {product.category}
                    </span>
                    {product.stock <= 10 && product.stock > 0 && (
                      <span className="text-xs text-amber-600 font-medium">Only {product.stock} left</span>
                    )}
                    {product.stock === 0 && (
                      <span className="text-xs text-red-500 font-medium">Out of stock</span>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-zinc-900 font-mono">${product.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      variant={inCartQty > 0 ? "secondary" : "primary"}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {inCartQty > 0 ? `In cart (${inCartQty})` : "Add"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
