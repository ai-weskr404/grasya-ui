import { Icon, Intent, Position, Toaster } from "@blueprintjs/core";
import { useEffect, useMemo, useState } from "react";

type Environment = "blue" | "green";
type DashboardView = "dashboard" | "schemaList" | "tableData";
type FolderType = "Tables" | "System Tables";

type TableRow = Record<string, string | number>;

type TableNode = {
  id: string;
  name: string;
  rows: TableRow[];
};

type FolderNode = {
  id: string;
  name: FolderType;
  tables: TableNode[];
};

type ClusterNode = {
  id: string;
  name: string;
  role: string;
  engine: string;
  regionAz: string;
  size: string;
  recommendations: string;
  cpu: string;
  connections: number;
  isMigrated: boolean;
  folders: FolderNode[];
};

const appToaster = Toaster.create({ position: Position.TOP_RIGHT });

const mockClusters: ClusterNode[] = [
  {
    id: "pg-blue",
    name: "PG",
    role: "Primary",
    engine: "PostgreSQL 15.4",
    regionAz: "us-east-1a",
    size: "db.r6g.large",
    recommendations: "2",
    cpu: "31%",
    connections: 124,
    isMigrated: false,
    folders: [
      {
        id: "pg-blue-tables",
        name: "Tables",
        tables: [
          {
            id: "public.customer",
            name: "public.customer",
            rows: [
              { customer_id: 1001, full_name: "Olivia Reed", tier: "Gold", updated_at: "2026-05-13 09:11:08" },
              { customer_id: 1002, full_name: "Noah Patel", tier: "Silver", updated_at: "2026-05-13 09:13:54" },
            ],
          },
          {
            id: "public.invoice",
            name: "public.invoice",
            rows: [
              { invoice_id: "INV-3001", customer_id: 1001, amount: 928.5, status: "PAID" },
              { invoice_id: "INV-3002", customer_id: 1002, amount: 124.0, status: "PENDING" },
            ],
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
            rows: [
              { oid: 1259, relname: "customer", relkind: "r" },
              { oid: 1260, relname: "invoice", relkind: "r" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "pg-green",
    name: "PG-Green",
    role: "Standby",
    engine: "PostgreSQL 15.4",
    regionAz: "us-east-1c",
    size: "db.r6g.large",
    recommendations: "0",
    cpu: "28%",
    connections: 118,
    isMigrated: true,
    folders: [
      {
        id: "pg-green-tables",
        name: "Tables",
        tables: [
          { id: "public.customer", name: "public.customer", rows: [{ customer_id: 1001, full_name: "Olivia Reed", tier: "Gold", updated_at: "2026-05-13 09:11:08" }] },
          { id: "public.invoice", name: "public.invoice", rows: [{ invoice_id: "INV-3001", customer_id: 1001, amount: 928.5, status: "PAID" }] },
        ],
      },
      { id: "pg-green-system", name: "System Tables", tables: [] },
    ],
  },
];

export function BlueGreenSimulationView() {
  const [isBlueActive, setIsBlueActive] = useState(true);
  const [activeView, setActiveView] = useState<DashboardView>("dashboard");
  const [selectedCluster, setSelectedCluster] = useState<ClusterNode | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedTable, setSelectedTable] = useState<TableNode | null>(null);
  const [query, setQuery] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  useEffect(() => {
    setActiveView("dashboard");
  }, []);

  const currentEnvBadge = (cluster: ClusterNode) => {
    const isProd = isBlueActive ? !cluster.isMigrated : cluster.isMigrated;
    return isProd ? (
      <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${isBlueActive ? "bg-blue-700" : "bg-emerald-700"}`}>
        {isBlueActive ? "BLUE" : "GREEN"}
      </span>
    ) : null;
  };

  const handleSwitchEnvironment = () => {
    setIsBlueActive((prev) => !prev);
    appToaster.show({ intent: Intent.SUCCESS, message: "Cutover completed. Production traffic rerouted with zero downtime." });
  };

  const handleLaunchDeployment = () => {
    appToaster.show({ intent: Intent.PRIMARY, message: "Blue/Green deployment package launched successfully." });
  };

  const openCluster = (cluster: ClusterNode) => {
    setSelectedCluster(cluster);
    setActiveView("schemaList");
  };

  const runQuery = () => {
    appToaster.show({ intent: Intent.SUCCESS, message: "Data retrieved seamlessly via Zero-Downtime Routing." });
  };

  const columns = useMemo(() => (selectedTable?.rows[0] ? Object.keys(selectedTable.rows[0]) : []), [selectedTable]);

  const filteredRows = useMemo(() => {
    if (!selectedTable) return [];
    return selectedTable.rows.filter((r) => JSON.stringify(r).toLowerCase().includes(tableSearch.toLowerCase()));
  }, [selectedTable, tableSearch]);

  return <div className="h-full overflow-auto bg-slate-100 p-4 text-xs text-slate-700">
    <div className="mb-3 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-800">beto-blog</h1>
      <div className="flex items-center gap-2">
        <button className="rounded-full border bg-white p-2"><Icon icon="refresh" size={12} /></button>
        <button onClick={handleSwitchEnvironment} className="rounded-md bg-slate-800 px-3 py-1.5 text-white">Switch Environment</button>
        <button className="rounded-md border border-slate-300 bg-white px-3 py-1.5">Modify</button>
        <button className="rounded-md border border-slate-300 bg-white px-3 py-1.5">Actions <Icon icon="caret-down" size={10} /></button>
      </div>
    </div>

    <div className="rounded-md border border-slate-300 bg-white p-3">
      <div className="mb-2 font-semibold">Related</div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex flex-1 items-center rounded border border-slate-300 px-2 py-1">
          <Icon icon="search" size={12} className="mr-2 text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by identifier" className="w-full border-none bg-transparent outline-none" />
        </div>
        <span>&lt; 1 &gt;</span>
        <button onClick={handleLaunchDeployment}><Icon icon="box" size={14} /></button>
        <button><Icon icon="cog" size={14} /></button>
      </div>

      {activeView === "dashboard" && <table className="w-full border-collapse text-[11px]">
        <thead className="bg-slate-50 text-slate-600"><tr className="border-y border-slate-200"><th></th><th className="text-left">DB identifier</th><th className="text-left">Status</th><th className="text-left">Role</th><th className="text-left">Engine</th><th className="text-left">Region & AZ</th><th className="text-left">Size</th><th className="text-left">Recommendations</th><th className="text-left">CPU</th><th className="text-left">Current connections</th></tr></thead>
        <tbody>{mockClusters.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).map((cluster) => <tr key={cluster.id} onClick={() => openCluster(cluster)} className="cursor-pointer border-b border-slate-200 hover:bg-slate-50"><td className="p-1"><input type="checkbox" /></td><td className="p-1 font-medium text-blue-700">{cluster.name}{currentEnvBadge(cluster)}</td><td className="p-1 text-emerald-700"><Icon icon="small-tick" /> Available</td><td className="p-1">{cluster.role}</td><td className="p-1">{cluster.engine}</td><td className="p-1">{cluster.regionAz}</td><td className="p-1">{cluster.size}</td><td className="p-1">{cluster.recommendations}</td><td className="p-1">{cluster.cpu}</td><td className="p-1">{cluster.connections}</td></tr>)}</tbody>
      </table>}

      {activeView === "schemaList" && selectedCluster && <div>
        <button className="mb-2 text-blue-700" onClick={() => setActiveView("dashboard")}>&larr; Back</button>
        <div className="mb-2 font-semibold">{selectedCluster.name} {currentEnvBadge(selectedCluster)}</div>
        {selectedCluster.folders.map((folder) => <div key={folder.id} className="mb-1">
          <button className="w-full rounded px-2 py-1 text-left hover:bg-slate-50" onClick={() => setExpandedFolders((p) => ({ ...p, [folder.id]: !p[folder.id] }))}><Icon icon={expandedFolders[folder.id] ? "chevron-down" : "chevron-right"} size={10} /> {folder.name}</button>
          {expandedFolders[folder.id] && <div className="ml-6">
            {folder.tables.map((table) => <button key={table.id} className="block w-full rounded px-2 py-1 text-left hover:bg-slate-50" onClick={() => { setSelectedTable(table); setActiveView("tableData"); }}>{table.name}</button>)}
          </div>}
        </div>)}
      </div>}

      {activeView === "tableData" && selectedTable && <div>
        <button className="mb-2 text-blue-700" onClick={() => setActiveView("schemaList")}>&larr; Back</button>
        <div className="mb-2 font-semibold">{selectedTable.name}</div>
        <div className="mb-2 flex gap-2">
          <input value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} className="flex-1 rounded border border-slate-300 px-2 py-1" placeholder="Search/query table data" />
          <button onClick={runQuery} className="rounded bg-blue-700 px-3 py-1 text-white">Run Query</button>
        </div>
        <table className="w-full border-collapse">
          <thead><tr className="border-y border-slate-200 bg-slate-50">{columns.map((c) => <th key={c} className="p-1 text-left">{c}</th>)}</tr></thead>
          <tbody>{filteredRows.map((row, i) => <tr key={i} className="border-b border-slate-200">{columns.map((c) => <td key={c} className="p-1">{String(row[c])}</td>)}</tr>)}</tbody>
        </table>
      </div>}
    </div>
  </div>;
}
