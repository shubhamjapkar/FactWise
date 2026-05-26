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

import { employees, type Employee } from "../data/employees";

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
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type Department = Employee["department"];

const DEPT_STYLES: Record<Department, { bg: string; fg: string; ring: string; avatar: string }> = {
  Engineering: { bg: "bg-sky-500/10", fg: "text-sky-300", ring: "ring-sky-500/30", avatar: "from-sky-500/60 to-sky-700/60" },
  Marketing: { bg: "bg-violet-500/10", fg: "text-violet-300", ring: "ring-violet-500/30", avatar: "from-violet-500/60 to-fuchsia-700/60" },
  Sales: { bg: "bg-emerald-500/10", fg: "text-emerald-300", ring: "ring-emerald-500/30", avatar: "from-emerald-500/60 to-teal-700/60" },
  HR: { bg: "bg-amber-500/10", fg: "text-amber-300", ring: "ring-amber-500/30", avatar: "from-amber-500/60 to-orange-700/60" },
  Finance: { bg: "bg-rose-500/10", fg: "text-rose-300", ring: "ring-rose-500/30", avatar: "from-rose-500/60 to-pink-700/60" },
};

function initialsOf(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function tenureYears(hireDate: string, today = new Date()) {
  const hire = new Date(hireDate);
  const ms = today.getTime() - hire.getTime();
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

function EmployeeCell({ data }: { data: Employee }) {
  const s = DEPT_STYLES[data.department];
  return (
    <div className="flex items-center gap-3 py-1">
      <div
        className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${s.avatar} text-xs font-semibold text-white ring-1 ${s.ring}`}
      >
        {initialsOf(data.firstName, data.lastName)}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-zinc-100 font-medium">
          {data.firstName} {data.lastName}
        </span>
        <span className="text-xs text-zinc-500">{data.email}</span>
      </div>
    </div>
  );
}

function DepartmentPill({ value }: { value: Department }) {
  const s = DEPT_STYLES[value];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.fg}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current opacity-80`} />
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
      <span className="text-zinc-400 text-xs tabular-nums">{value.toFixed(1)}</span>
    </span>
  );
}

function ProjectsCell({ value }: { value: number }) {
  const max = 25;
  const pct = Math.min(100, (value / max) * 100);
  const barColor = value >= 15 ? "bg-emerald-400/80" : value >= 8 ? "bg-sky-400/80" : "bg-amber-400/80";
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-zinc-300 text-xs w-6 text-right">{value}</span>
    </div>
  );
}

function SkillsCell({ value }: { value: string[] }) {
  if (!value?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 py-1">
      {value.slice(0, 3).map((skill) => (
        <span key={skill} className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300">
          {skill}
        </span>
      ))}
    </div>
  );
}

function StatusPill({ value }: { value: boolean }) {
  const cls = value
    ? "bg-emerald-500/10 text-emerald-300"
    : "bg-zinc-500/10 text-zinc-400";
  const dot = value ? "bg-emerald-400" : "bg-zinc-500";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {value ? "Active" : "Inactive"}
    </span>
  );
}

type Row = Employee & { tenure: number; fullName: string };

export default function Dashboard() {
  const gridRef = useRef<AgGridReact<Row>>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState<"All" | Department>("All");

  const rowData = useMemo<Row[]>(
    () =>
      employees.map((e) => ({
        ...e,
        tenure: tenureYears(e.hireDate),
        fullName: `${e.firstName} ${e.lastName}`,
      })),
    []
  );

  const departments = useMemo<Array<"All" | Department>>(
    () => ["All", ...(Array.from(new Set(employees.map((e) => e.department))).sort() as Department[])],
    []
  );

  const filteredData = useMemo(
    () => (deptFilter === "All" ? rowData : rowData.filter((r) => r.department === deptFilter)),
    [rowData, deptFilter]
  );

  const stats = useMemo(() => {
    const totalPayroll = rowData.reduce((s, r) => s + r.salary, 0);
    const activeCount = rowData.filter((r) => r.isActive).length;
    const avgRating = rowData.reduce((s, r) => s + r.performanceRating, 0) / rowData.length;
    const departments = new Set(rowData.map((r) => r.department)).size;
    return { totalPayroll, activeCount, avgRating, departments, count: rowData.length };
  }, [rowData]);

  const columnDefs = useMemo<ColDef<Row>[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 80,
        pinned: "left",
        cellClass: "font-mono text-xs text-zinc-400",
      },
      {
        field: "fullName",
        headerName: "Employee",
        flex: 1.8,
        minWidth: 250,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<Row>) =>
          p.data ? <EmployeeCell data={p.data} /> : null,
      },
      {
        field: "department",
        headerName: "Department",
        width: 140,
        cellRenderer: (p: ICellRendererParams<Row, Department>) =>
          p.value ? <DepartmentPill value={p.value} /> : null,
      },
      {
        field: "position",
        headerName: "Position",
        flex: 1.1,
        minWidth: 180,
        cellClass: "text-zinc-200",
      },
      {
        field: "location",
        headerName: "Location",
        width: 130,
        cellClass: "text-zinc-300",
      },
      {
        field: "salary",
        headerName: "Salary",
        width: 110,
        type: "numericColumn",
        valueFormatter: (p: ValueFormatterParams<Row, number>) =>
          p.value == null ? "" : currencyFmt.format(p.value),
        cellClass: "tabular-nums text-zinc-100 font-medium",
      },
      {
        field: "performanceRating",
        headerName: "Performance",
        width: 150,
        cellRenderer: (p: ICellRendererParams<Row, number>) =>
          p.value == null ? null : <RatingCell value={p.value} />,
      },
      {
        field: "projectsCompleted",
        headerName: "Projects",
        width: 150,
        cellRenderer: (p: ICellRendererParams<Row, number>) =>
          p.value == null ? null : <ProjectsCell value={p.value} />,
      },
      {
        field: "skills",
        headerName: "Skills",
        flex: 1.4,
        minWidth: 240,
        sortable: false,
        cellRenderer: (p: ICellRendererParams<Row, string[]>) =>
          p.value ? <SkillsCell value={p.value} /> : null,
      },
      {
        field: "tenure",
        headerName: "Tenure",
        width: 110,
        valueFormatter: (p: ValueFormatterParams<Row, number>) =>
          p.value == null ? "" : `${p.value.toFixed(1)} yrs`,
        cellClass: "tabular-nums text-zinc-300",
      },
      {
        field: "hireDate",
        headerName: "Hire Date",
        width: 140,
        valueFormatter: (p: ValueFormatterParams<Row, string>) =>
          p.value ? dateFmt.format(new Date(p.value)) : "",
        cellClass: "text-zinc-300",
      },
      {
        field: "manager",
        headerName: "Manager",
        width: 160,
        cellRenderer: (p: ICellRendererParams<Row, string | null>) =>
          p.value ? (
            <span className="text-zinc-300">{p.value}</span>
          ) : (
            <span className="text-zinc-600 italic">—</span>
          ),
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: ICellRendererParams<Row, boolean>) =>
          p.value == null ? null : <StatusPill value={p.value} />,
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
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Employee Directory</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Live snapshot of headcount, compensation, and performance across the organization.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Synced moments ago
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Headcount"
            value={stats.count.toString()}
            hint={`${stats.activeCount} active`}
            tone="sky"
          />
          <StatCard
            label="Total Payroll"
            value={currencyFmt.format(stats.totalPayroll)}
            hint="Annualized"
            tone="emerald"
          />
          <StatCard
            label="Avg. Performance"
            value={stats.avgRating.toFixed(2)}
            hint="Out of 5.0"
            tone="amber"
          />
          <StatCard
            label="Departments"
            value={stats.departments.toString()}
            hint="Active teams"
            tone="violet"
          />
        </section>

        <section className="rounded-2xl border border-zinc-800/80 bg-[#0b1220] shadow-2xl shadow-black/40">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-5 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-200">All Employees</h2>
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400">
                {filteredData.length} {filteredData.length === 1 ? "record" : "records"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
                {departments.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDeptFilter(d)}
                    className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                      deptFilter === d
                        ? "bg-sky-500/15 text-sky-300"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <input
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="Search name, skill, location…"
                className="w-64 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
              />
            </div>
          </div>

          <div className="p-3">
            <div style={{ height: 620, width: "100%" }}>
              <AgGridReact<Row>
                ref={gridRef}
                theme={theme}
                rowData={filteredData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                quickFilterText={quickFilter}
                animateRows
                rowHeight={56}
                headerHeight={44}
                onGridReady={onGridReady}
              />
            </div>
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-zinc-600">
          Built with AG Grid v35 · Client-side rendering · {employees.length} sample records
        </footer>
      </div>
    </div>
  );
}

type Tone = "sky" | "emerald" | "amber" | "violet";

function StatCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: Tone }) {
  const tones: Record<Tone, string> = {
    sky: "from-sky-500/15 to-sky-500/0 border-sky-500/20",
    emerald: "from-emerald-500/15 to-emerald-500/0 border-emerald-500/20",
    amber: "from-amber-500/15 to-amber-500/0 border-amber-500/20",
    violet: "from-violet-500/15 to-violet-500/0 border-violet-500/20",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-zinc-50">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}
