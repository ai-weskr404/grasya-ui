import { Icon } from "@blueprintjs/core";
import { useMemo, useState } from "react";

type Env = "blue" | "green";
type View = "dashboard" | "schema" | "table";
type DataRow = Record<string, string | number>;

type TableDef = { id: string; name: string; rows: DataRow[] };
type FolderDef = {
  id: string;
  name: "Tables" | "System Tables";
  tables: TableDef[];
};
type ClusterDef = {
  id: string;
  identifier: string;
  role: string;
  engine: string;
  regionAz: string;
  size: string;
  recommendations: number;
  cpu: number;
  currentConnections: number;
  isGreen: boolean;
  folders: FolderDef[];
};

type DashboardData = { clusters: ClusterDef[] };

const buildMockData = (): DashboardData => ({
  clusters: [
    {
      id: "pg-blue",
      identifier: "PG",
      role: "Primary",
      engine: "PostgreSQL 15.4",
      regionAz: "us-east-1a",
      size: "db.r6g.large",
      recommendations: 2,
      cpu: 31,
      currentConnections: 124,
      isGreen: false,
      folders: [
        {
          id: "pg-blue-tables",
          name: "Tables",
          tables: [
            {
              id: "public.customer",
              name: "public.customer",
              rows: Array.from({ length: 300 }, (_, i) => ({
                customer_id: 1000 + i,
                full_name: `Customer ${i + 1}`,
                tier: i % 2 ? "Silver" : "Gold",
                updated_at: "2026-05-13 09:11:08",
              })),
            },
            {
              id: "public.invoice",
              name: "public.invoice",
              rows: Array.from({ length: 260 }, (_, i) => ({
                invoice_id: `INV-${3000 + i}`,
                customer_id: 1000 + (i % 100),
                amount: 100 + i * 1.3,
                status: i % 3 ? "PAID" : "PENDING",
              })),
            },
          ],
        },
        {
          id: "pg-blue-system",
          name: "System Tables",
          tables: [
            {
              id: "pg_catalog.pg_class",
              name: "pg_catalog.pg_class",
              rows: [{ oid: 1259, relname: "customer", relkind: "r" }],
            },
          ],
        },
      ],
    },
    {
      id: "pg-green",
      identifier: "PG-Green",
      role: "Standby",
      engine: "PostgreSQL 15.4",
      regionAz: "us-east-1c",
      size: "db.r6g.large",
      recommendations: 0,
      cpu: 28,
      currentConnections: 118,
      isGreen: true,
      folders: [
        {
          id: "pg-green-tables",
          name: "Tables",
          tables: [
            {
              id: "public.customer",
              name: "public.customer",
              rows: [
                {
                  customer_id: 1001,
                  full_name: "Customer 1",
                  tier: "Gold",
                  updated_at: "2026-05-13 09:11:08",
                },
              ],
            },
          ],
        },
        { id: "pg-green-system", name: "System Tables", tables: [] },
      ],
    },
  ],
});

const statusPill =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold";

export function BlueGreenSimulationView() {
  const [env, setEnv] = useState<Env>("blue");
  const [view, setView] = useState<View>("dashboard");
  const [data, setData] = useState<DashboardData>(() => buildMockData());
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null,
  );
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [toast, setToast] = useState("");

  const selectedCluster = useMemo(
    () => data.clusters.find((c) => c.id === selectedClusterId) || null,
    [data, selectedClusterId],
  );
  const selectedTable = useMemo(
    () =>
      selectedCluster?.folders
        .flatMap((f) => f.tables)
        .find((t) => t.id === selectedTableId) || null,
    [selectedCluster, selectedTableId],
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const handleSwitch = () => {
    setEnv((e) => (e === "blue" ? "green" : "blue"));
    showToast(
      "Cutover completed. Production traffic rerouted with zero downtime.",
    );
  };

  const handleLaunchDeployment = () => {
    setData((prev) => ({ ...prev }));
    showToast("Blue/Green deployment package launched successfully.");
  };

  const rows = useMemo(() => {
    if (!selectedTable) return [];
    return selectedTable.rows.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(tableSearch.toLowerCase()),
    );
  }, [selectedTable, tableSearch]);
  const columns = useMemo(
    () =>
      rows[0]
        ? Object.keys(rows[0])
        : selectedTable?.rows[0]
          ? Object.keys(selectedTable.rows[0])
          : [],
    [rows, selectedTable],
  );

  return (
    <div className="h-full overflow-auto bg-slate-100 p-4 text-[12px] text-slate-700">
      {toast && (
        <div className="fixed right-6 top-16 z-50 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 shadow">
          {toast}
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">
          Databases
        </h1>
        <div className="flex items-center gap-2">
          <button className="app-btn app-icon-btn h-8 w-8 rounded-full border border-slate-300 bg-white">
            <Icon icon="refresh" size={12} />
          </button>
          <button
            onClick={handleSwitch}
            className="h-8 rounded-md bg-slate-800 px-4 text-white"
          >
            Switch Environment
          </button>
          <button className="h-8 rounded-md border border-slate-300 bg-white px-4">
            Modify
          </button>
          <button className="h-8 rounded-md border border-slate-300 bg-white px-4">
            Actions <Icon icon="caret-down" size={10} />
          </button>
        </div>
      </div>

      <div className="rounded-md border border-slate-300 bg-white p-3 shadow-sm">
        <div className="mb-2 font-semibold text-slate-700">Related</div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex flex-1 items-center rounded border border-slate-300 bg-white px-2 py-1.5">
            <Icon icon="search" size={12} className="mr-2 text-slate-500" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="Filter by identifier"
            />
          </div>
          <span className="text-slate-600">&lt; 1 &gt;</span>
          <button
            className="text-slate-700 hover:text-slate-900"
            onClick={handleLaunchDeployment}
          >
            <Icon icon="package" size={14} />
          </button>
          <button className="text-slate-700 hover:text-slate-900">
            <Icon icon="cog" size={14} />
          </button>
        </div>

        {view === "dashboard" && (
          <table className="w-full border-collapse text-[11px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="border-y border-slate-200">
                <th className="p-1" />
                <th className="p-1 text-left">DB identifier</th>
                <th className="p-1 text-left">Status</th>
                <th className="p-1 text-left">Role</th>
                <th className="p-1 text-left">Engine</th>
                <th className="p-1 text-left">Region & AZ</th>
                <th className="p-1 text-left">Size</th>
                <th className="p-1 text-left">Recommendations</th>
                <th className="p-1 text-left">CPU</th>
                <th className="p-1 text-left">Current connections</th>
              </tr>
            </thead>
            <tbody>
              {data.clusters
                .filter((c) =>
                  c.identifier
                    .toLowerCase()
                    .includes(globalSearch.toLowerCase()),
                )
                .map((cluster) => {
                  const isProd =
                    env === "blue" ? !cluster.isGreen : cluster.isGreen;
                  return (
                    <tr
                      key={cluster.id}
                      onClick={() => {
                        setSelectedClusterId(cluster.id);
                        setView("schema");
                      }}
                      className="cursor-pointer border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-1">
                        <input type="checkbox" />
                      </td>
                      <td className="p-1 font-medium text-blue-700">
                        {cluster.identifier}{" "}
                        {isProd && (
                          <span
                            className={`${statusPill} ${env === "blue" ? "bg-blue-700 text-white" : "bg-emerald-700 text-white"}`}
                          >
                            {env.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="p-1 text-emerald-700">
                        <Icon icon="small-tick" /> Available
                      </td>
                      <td className="p-1">{cluster.role}</td>
                      <td className="p-1">{cluster.engine}</td>
                      <td className="p-1">{cluster.regionAz}</td>
                      <td className="p-1">{cluster.size}</td>
                      <td className="p-1">{cluster.recommendations}</td>
                      <td className="p-1">{cluster.cpu}%</td>
                      <td className="p-1">{cluster.currentConnections}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {view === "schema" && selectedCluster ? (
          <div>
            <button
              className="mb-2 text-blue-700"
              onClick={() => setView("dashboard")}
            >
              ← Back
            </button>
            <div className="mb-2 text-sm font-semibold">
              {selectedCluster.identifier}
            </div>
            {selectedCluster.folders.map((folder) => (
              <div key={folder.id} className="mb-1">
                <button
                  className="w-full rounded px-2 py-1 text-left hover:bg-slate-50"
                  onClick={() =>
                    setExpanded((p) => ({ ...p, [folder.id]: !p[folder.id] }))
                  }
                >
                  <Icon
                    icon={
                      expanded[folder.id] ? "chevron-down" : "chevron-right"
                    }
                    size={10}
                  />{" "}
                  {folder.name}
                </button>
                {expanded[folder.id] && (
                  <div className="ml-5">
                    {folder.tables.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTableId(t.id);
                          setView("table");
                        }}
                        className="block w-full rounded px-2 py-1 text-left hover:bg-slate-50"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {view === "table" && selectedTable ? (
          <div>
            <button
              className="mb-2 text-blue-700"
              onClick={() => setView("schema")}
            >
              ← Back
            </button>
            <div className="mb-2 font-semibold">{selectedTable.name}</div>
            <div className="mb-2 flex gap-2">
              <input
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="flex-1 rounded border border-slate-300 px-2 py-1"
                placeholder="Search/query table data"
              />
              <button
                onClick={() =>
                  showToast(
                    "Data retrieved seamlessly via Zero-Downtime Routing.",
                  )
                }
                className="rounded bg-blue-700 px-3 py-1 text-white"
              >
                Run Query
              </button>
            </div>
            <div className="max-h-[420px] overflow-auto rounded border border-slate-200">
              <table className="w-full border-collapse text-[11px]">
                <thead className="sticky top-0 bg-slate-50">
                  {" "}
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c}
                        className="border-b border-slate-200 p-1 text-left"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {columns.map((c) => (
                        <td key={c} className="p-1">
                          {String(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
