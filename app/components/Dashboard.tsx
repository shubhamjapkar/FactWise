"use client";

import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  colorSchemeDarkBlue,
  type ColDef,
  type GridReadyEvent,
  type ICellRendererParams,
  type ValueFormatterParams,
} from "ag-grid-community";

import { products, type Product, type ProductStatus } from "../data/products";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
  backgroundColor: "#0b1220",
  foregroundColor: "#e5e7eb",
  headerBackgroundColor: "#111a2e",
  headerTextColor: "#cbd5e1",
  rowHoverColor: "#13203a",
  selectedRowBackgroundColor: "#1e3a8a33",
  oddRowBackgroundColor: "#0e1628",
  borderColor: "#1f2a44",
  wrapperBorderRadius: 12,
  fontFamily: "var(--font-sans, ui-sans-serif, system-ui)",
  headerFontWeight: 600,
});

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const STATUS_STYLES: Record<ProductStatus, { bg: string; fg: string; dot: string }> = {
  "In Stock": { bg: "bg-emerald-500/10", fg: "text-emerald-300", dot: "bg-emerald-400" },
  "Low Stock": { bg: "bg-amber-500/10", fg: "text-amber-300", dot: "bg-amber-400" },
  "Out of Stock": { bg: "bg-rose-500/10", fg: "text-rose-300", dot: "bg-rose-400" },
  Discontinued: { bg: "bg-zinc-500/10", fg: "text-zinc-300", dot: "bg-zinc-400" },
};

function StatusPill({ value }: { value: ProductStatus }) {
  const s = STATUS_STYLES[value];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.fg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {value}
    </span>
  );
}

function RatingCell({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="text-amber-400">
        {"★".repeat(full)}
        <span className="text-zinc-600">{"★".repeat(5 - full)}</span>
      </span>
      <span className="text-zinc-400 text-xs">{value.toFixed(1)}</span>
    </span>
  );
}

function MarginCell({ value }: { value: number }) {
  const pct = value * 100;
  const tone =
    pct >= 55 ? "text-emerald-300" : pct >= 40 ? "text-sky-300" : pct >= 25 ? "text-amber-300" : "text-rose-300";
  return <span className={`font-medium ${tone}`}>{pct.toFixed(1)}%</span>;
}

function StockCell({ value }: { value: number }) {
  const max = 420;
  const pct = Math.min(100, (value / max) * 100);
  const barColor = value === 0 ? "bg-rose-500/70" : value < 25 ? "bg-amber-400/80" : "bg-sky-400/80";
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-zinc-300 text-xs w-10 text-right">{value}</span>
    </div>
  );
}

type Row = Product & { margin: number };

export default function Dashboard() {
  const gridRef = useRef<AgGridReact<Row>>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const rowData = useMemo<Row[]>(
    () => products.map((p) => ({ ...p, margin: (p.price - p.cost) / p.price })),
    []
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()],
    []
  );

  const filteredData = useMemo(
    () => (categoryFilter === "All" ? rowData : rowData.filter((r) => r.category === categoryFilter)),
    [rowData, categoryFilter]
  );

  const stats = useMemo(() => {
    const totalValue = rowData.reduce((sum, r) => sum + r.price * r.stock, 0);
    const lowStock = rowData.filter((r) => r.status === "Low Stock" || r.status === "Out of Stock").length;
    const avgRating = rowData.reduce((s, r) => s + r.rating, 0) / rowData.length;
    const totalUnits = rowData.reduce((s, r) => s + r.stock, 0);
    return { totalValue, lowStock, avgRating, totalUnits, count: rowData.length };
  }, [rowData]);

  const columnDefs = useMemo<ColDef<Row>[]>(
    () => [
      {
        field: "sku",
        headerName: "SKU",
        width: 120,
        pinned: "left",
        cellClass: "font-mono text-xs text-zinc-400",
      },
      {
        field: "name",
        headerName: "Product",
        flex: 1.6,
        minWidth: 220,
        cellRenderer: (p: ICellRendererParams<Row>) => (
          <div className="flex flex-col leading-tight py-1">
            <span className="text-zinc-100 font-medium">{p.value}</span>
            <span className="text-xs text-zinc-500">{p.data?.supplier}</span>
          </div>
        ),
      },
      {
        field: "category",
        headerName: "Category",
        width: 130,
        cellRenderer: (p: ICellRendererParams<Row>) => (
          <span className="rounded-md bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-300">{p.value}</span>
        ),
      },
      {
        field: "price",
        headerName: "Price",
        width: 110,
        type: "numericColumn",
        valueFormatter: (p: ValueFormatterParams<Row, number>) =>
          p.value == null ? "" : currencyFmt.format(p.value),
        cellClass: "tabular-nums",
      },
      {
        field: "margin",
        headerName: "Margin",
        width: 110,
        type: "numericColumn",
        cellRenderer: (p: ICellRendererParams<Row, number>) =>
          p.value == null ? null : <MarginCell value={p.value} />,
      },
      {
        field: "stock",
        headerName: "Stock",
        width: 180,
        cellRenderer: (p: ICellRendererParams<Row, number>) =>
          p.value == null ? null : <StockCell value={p.value} />,
      },
      {
        field: "rating",
        headerName: "Rating",
        width: 140,
        cellRenderer: (p: ICellRendererParams<Row, number>) =>
          p.value == null ? null : <RatingCell value={p.value} />,
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        cellRenderer: (p: ICellRendererParams<Row, ProductStatus>) =>
          p.value ? <StatusPill value={p.value} /> : null,
      },
      {
        field: "lastRestocked",
        headerName: "Last Restocked",
        width: 150,
        valueFormatter: (p: ValueFormatterParams<Row, string>) =>
          p.value ? dateFmt.format(new Date(p.value)) : "",
        cellClass: "text-zinc-300",
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<Row>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressHeaderMenuButton: true,
    }),
    []
  );

  const onGridReady = (e: GridReadyEvent<Row>) => {
    e.api.sizeColumnsToFit();
  };

  return (
    <div className="min-h-screen w-full bg-[#070b15] text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-400/80">Factwise Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Product Inventory</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Live view of catalog stock, margins, and supplier performance.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Synced moments ago
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Products" value={stats.count.toString()} hint="In catalog" tone="sky" />
          <StatCard
            label="Inventory Value"
            value={currencyFmt.format(stats.totalValue)}
            hint={`${stats.totalUnits.toLocaleString()} units on hand`}
            tone="emerald"
          />
          <StatCard
            label="Needs Attention"
            value={stats.lowStock.toString()}
            hint="Low or out of stock"
            tone="amber"
          />
          <StatCard
            label="Avg. Rating"
            value={stats.avgRating.toFixed(2)}
            hint="Across all products"
            tone="violet"
          />
        </section>

        <section className="rounded-2xl border border-zinc-800/80 bg-[#0b1220] shadow-2xl shadow-black/40">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-5 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-200">Catalog</h2>
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400">
                {filteredData.length} rows
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                      categoryFilter === c
                        ? "bg-sky-500/15 text-sky-300"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="Search products…"
                className="w-56 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
              />
            </div>
          </div>

          <div className="p-3">
            <div style={{ height: 560, width: "100%" }}>
              <AgGridReact<Row>
                ref={gridRef}
                theme={theme}
                rowData={filteredData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                quickFilterText={quickFilter}
                animateRows
                rowHeight={52}
                headerHeight={44}
                onGridReady={onGridReady}
              />
            </div>
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-zinc-600">
          Built with AG Grid {`v35`} · Client-side rendering · {products.length} sample records
        </footer>
      </div>
    </div>
  );
}

type Tone = "sky" | "emerald" | "amber" | "violet";

function StatCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: Tone }) {
  const tones: Record<Tone, string> = {
    sky: "from-sky-500/15 to-sky-500/0 border-sky-500/20 text-sky-300",
    emerald: "from-emerald-500/15 to-emerald-500/0 border-emerald-500/20 text-emerald-300",
    amber: "from-amber-500/15 to-amber-500/0 border-amber-500/20 text-amber-300",
    violet: "from-violet-500/15 to-violet-500/0 border-violet-500/20 text-violet-300",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-zinc-50">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}