import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Car,
  Star,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Users,
  Tag,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const VEHICLES = [
  { id: 1, make: "Toyota", model: "Corolla", category: "Sedan", price: 22000, stock: 5, rating: 4.8, img: "https://images.unsplash.com/photo-1623869675184-6d1eb1de3dc5?q=80&w=800&auto=format&fit=crop" },
  { id: 2, make: "BMW", model: "X5", category: "SUV", price: 45000, stock: 2, rating: 4.9, img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop" },
  { id: 3, make: "Audi", model: "A4", category: "Sedan", price: 35000, stock: 8, rating: 4.6, img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=800&auto=format&fit=crop" },
  { id: 4, make: "Ford", model: "F-150", category: "Truck", price: 38000, stock: 6, rating: 4.5, img: "https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=800&auto=format&fit=crop" },
  { id: 5, make: "Chevrolet", model: "Camaro", category: "Coupe", price: 41000, stock: 0, rating: 4.7, img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop" },
  { id: 6, make: "Honda", model: "CR-V", category: "SUV", price: 29000, stock: 4, rating: 4.4, img: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?q=80&w=800&auto=format&fit=crop" },
  { id: 7, make: "Mercedes", model: "C-Class", category: "Sedan", price: 48000, stock: 3, rating: 4.9, img: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=800&auto=format&fit=crop" },
  { id: 8, make: "Porsche", model: "911", category: "Coupe", price: 112000, stock: 1, rating: 5.0, img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop" },
];

const CATEGORIES = ["All", "SUV", "Sedan", "Coupe", "Truck"];
const SORTS = [
  { value: "none", label: "Sort by" },
  { value: "price-asc", label: "Price Low → High" },
  { value: "price-desc", label: "Price High → Low" },
  { value: "newest", label: "Newest" },
];

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "vehicles", label: "Vehicles", icon: Car },
  { key: "favorites", label: "Favorites", icon: Star },
  { key: "settings", label: "Settings", icon: Settings },
];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const fmt = (n) => `$${n.toLocaleString()}`;

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight text-[#1E293B]">{value}</p>
        <p className="truncate text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="h-40 w-full animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, isFavorite, onToggleFavorite }) {
  const outOfStock = vehicle.stock === 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl animate-[fadeIn_0.4s_ease-out]">
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={vehicle.img}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <button
          onClick={() => onToggleFavorite(vehicle.id)}
          aria-label="Toggle favorite"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={16}
            className={isFavorite ? "fill-[#2563EB] text-[#2563EB]" : "text-slate-400"}
          />
        </button>
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-[#EF4444] px-2.5 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-[#1E293B]">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className="text-xs text-slate-500">{vehicle.category}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {vehicle.rating.toFixed(1)}
          </div>
        </div>

        <p className="text-lg font-bold text-[#2563EB]">{fmt(vehicle.price)}</p>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span
            className={`h-1.5 w-1.5 rounded-full ${outOfStock ? "bg-[#EF4444]" : "bg-[#22C55E]"}`}
          />
          Stock : {vehicle.stock}
        </div>

        <button
          disabled={outOfStock}
          className="mt-2 w-full rounded-lg bg-[#2563EB] py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1d4fd1] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {outOfStock ? "Unavailable" : "Purchase"}
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center ring-1 ring-slate-100">
      <span className="text-4xl">🚗</span>
      <p className="mt-3 font-semibold text-[#1E293B]">No vehicles found.</p>
      <p className="text-sm text-slate-500">Try another search.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------
export default function VehicleDashboard() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("none");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = VEHICLES.filter((v) => {
      const matchesQuery =
        `${v.make} ${v.model}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || v.category === category;
      const matchesFavorites = activeNav !== "favorites" || favorites.has(v.id);
      return matchesQuery && matchesCategory && matchesFavorites;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => b.id - a.id);
    return list;
  }, [query, category, sort, activeNav, favorites]);

  const stats = [
    { icon: Car, label: "Total Vehicles", value: VEHICLES.length, accent: "#2563EB" },
    {
      icon: CheckCircle2,
      label: "Available Vehicles",
      value: VEHICLES.filter((v) => v.stock > 0).length,
      accent: "#22C55E",
    },
    { icon: Tag, label: "Categories", value: CATEGORIES.length - 1, accent: "#F59E0B" },
    { icon: Users, label: "Customers", value: 128, accent: "#8B5CF6" },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]">
            <Car size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">DriveHub</span>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveNav(key);
                setMobileNavOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                activeNav === key
                  ? "bg-[#2563EB] text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-3 pb-6">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors duration-200 hover:bg-white/5 hover:text-white">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans text-[#1E293B]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
              <Car size={16} className="text-white" />
            </div>
            <span className="font-bold">DriveHub</span>
          </div>
        </div>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make, model..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#2563EB] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
              N
            </div>
            <span className="hidden text-sm font-medium sm:block">Nilakshi</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 bg-[#0F172A] lg:block">
          <SidebarContent />
        </aside>

        {/* Sidebar - mobile drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="relative h-full w-64 bg-[#0F172A] shadow-xl animate-[fadeIn_0.2s_ease-out]">
              <button
                className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/5"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <h1 className="text-xl font-bold text-[#1E293B]">Welcome Back 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening with your fleet today.</p>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Search + filters */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:hidden">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search make, model..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                    category === c
                      ? "bg-[#2563EB] text-white"
                      : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-600 outline-none focus:border-[#2563EB] sm:w-auto"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Grid */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  isFavorite={favorites.has(v.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
