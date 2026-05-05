import { useState, useEffect, useRef } from "react";
import { Icon } from "@blueprintjs/core";

import type { LogEntry, FileNode } from "./types";
import { INITIAL_LOGS, DB_SCHEMA } from "./data/mock-data";

import { MenuBar } from "./menu";
import DiagramPane from "./components/erd/DiagramPane";
import type { TableDef } from "./components/erd/types";
import { MigrationWizard } from "./components/modals/ConnectionDialog";
import { MonitorView } from "./components/views/MonitorView";

// --- HELPER: Generate Mock Rows ---
const generateMockRows = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: 1000 + i,
    uid: Math.floor(Math.random() * 500) + 1,
    item: [
      "RTX 4090",
      "Ryzen 9",
      "DDR5-32G",
      "NVMe 2TB",
      "Case Fan",
      "PSU 850W",
      "Monitor 4K",
    ][Math.floor(Math.random() * 7)],
    price: Math.floor(Math.random() * 1500) + 50,
    status: "pending",
    lsn: `0/${(160000 + i).toString(16).toUpperCase()}`,
  }));
};

const defaultColumns = [
  { name: "id", type: "int", isPrimary: true, notNull: true },
  { name: "created_at", type: "timestamp", notNull: true },
  { name: "updated_at", type: "timestamp", notNull: false },
  { name: "status", type: "varchar", notNull: false },
];

const tableRelationshipMap: Record<string, { fkColumn: string; referencesTable: string }[]> = {
  orders: [{ fkColumn: "customer_id", referencesTable: "customers" }],
  order_items: [
    { fkColumn: "order_id", referencesTable: "orders" },
    { fkColumn: "product_id", referencesTable: "products" },
  ],
  products: [{ fkColumn: "category_id", referencesTable: "categories" }],
  invoices: [{ fkColumn: "order_id", referencesTable: "orders" }],
  payments: [{ fkColumn: "invoice_id", referencesTable: "invoices" }],
};

const getTableKey = (tableName: string) =>
  tableName
    .toLowerCase()
    .split(".")
    .filter(Boolean)
    .at(-1)
    ?.replace(/[^a-z0-9_]/g, "") ?? "";

const mapSelectedTablesToDiagram = (selectedTables: string[]): TableDef[] => {
  const selected = new Set(selectedTables.map((table) => getTableKey(table)));
  const orderedTableKeys = selectedTables.map((table) => getTableKey(table));
  const previousTableLookup = new Map(
    orderedTableKeys.map((tableKey, index) => [
      tableKey,
      orderedTableKeys[(index - 1 + orderedTableKeys.length) % orderedTableKeys.length],
    ]),
  );

  return selectedTables.map((name) => {
    const tableKey = getTableKey(name);
    const mappedRelationships = (tableRelationshipMap[tableKey] ?? []).filter((rel) =>
      selected.has(rel.referencesTable),
    );
    const fallbackRelationship =
      previousTableLookup.size > 1
        ? {
            fkColumn: `${previousTableLookup.get(tableKey)}_id`,
            referencesTable: previousTableLookup.get(tableKey) ?? "",
          }
        : null;
    const relationships =
      mappedRelationships.length > 0
        ? mappedRelationships
        : fallbackRelationship && fallbackRelationship.referencesTable !== tableKey
          ? [fallbackRelationship]
          : [];

    const relationshipColumns = relationships.map((relationship) => ({
      name: relationship.fkColumn,
      type: "int",
      isForeign: true,
      notNull: true,
      referencesTable: relationship.referencesTable,
    }));

    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      name,
      schema: "dbo",
      columns: [
        { name: `${tableKey}_id`, type: "int", isPrimary: true, notNull: true },
        ...relationshipColumns,
        ...defaultColumns.slice(1),
      ],
    };
  });
};

// --- FEATURE COMPONENT: Live Schema Map Tab ---
const SchemaMapTab = ({
  isRunning,
  tableName,
}: {
  isRunning: boolean;
  tableName: string;
}) => {
  const [allRows] = useState(() => generateMockRows(1000));
  const [visibleCount, setVisibleCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Animation Loop
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setVisibleCount((prev) => {
          if (prev >= allRows.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning, allRows.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isRunning && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleCount, isRunning]);

  const visibleRows = allRows.slice(0, visibleCount);

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50 relative">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Icon icon="database" className="text-blue-600" size={18} />
            Stream: {tableName}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Total Records: {allRows.length} | Ingested: {visibleCount}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1 border rounded shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
          ></span>
          {isRunning ? "Ingesting Live Data" : "Waiting for Stream"}
        </div>
      </div>

      <div className="border border-slate-300 rounded bg-white shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-6 bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-600 py-2 px-4 shrink-0 scrollbar-gutter-stable">
          <div className="col-span-1">LSN (Log Seq)</div>
          <div className="col-span-1">ID (PK)</div>
          <div className="col-span-1">User ID</div>
          <div className="col-span-1">Item</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">State</div>
        </div>

        <div className="overflow-y-auto flex-1 p-0 scroll-smooth">
          <div className="divide-y divide-slate-100">
            {visibleRows.map((row, index) => {
              const isProcessing = index > visibleCount - 10;
              return (
                <div
                  key={row.id}
                  className={`
                    grid grid-cols-6 py-1.5 px-4 text-[10px] font-mono transition-colors duration-200 items-center
                    ${isProcessing ? "bg-blue-50 text-blue-900" : "text-slate-600"}
                  `}
                >
                  <div className="col-span-1 text-slate-400">{row.lsn}</div>
                  <div className="col-span-1 font-bold">{row.id}</div>
                  <div className="col-span-1">{row.uid}</div>
                  <div className="col-span-1 truncate pr-2">{row.item}</div>
                  <div className="col-span-1 text-green-700">${row.price}</div>
                  <div className="col-span-1">
                    {isProcessing ? (
                      <span className="flex items-center gap-1 text-blue-600 font-bold">
                        LOAD...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600">
                        ✓ committed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: Dead Letter Queue ---
const DeadLetterQueueTab = () => (
  <div className="h-full bg-slate-50 p-6 flex flex-col">
    <h2 className="text-lg font-semibold text-slate-800 mb-4">
      Dead Letter Queue
    </h2>
    <div className="border border-red-200 bg-red-50 rounded p-4 text-sm text-red-700">
      No dead letters currently.
    </div>
  </div>
);

// --- COMPONENT: Internal Tree Node ---
const InternalTreeNode = ({ node, level, onToggle, onSelect }: any) => {
  const isLeaf = !node.children;
  const isDatabaseRoot = level === 0;

  const getNodeIcon = () => {
    if (isDatabaseRoot) return "database";
    if (!isLeaf) return "folder-close";
    if (node.type === "table") return "th";
    if (node.type === "view") return "eye-open";
    if (node.type === "proc") return "function";
    return "document";
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1.5 py-0.5 px-2 cursor-pointer hover:bg-sky-100 text-[11px] rounded-sm ${
          level > 0 ? "ml-4" : ""
        }`}
        onClick={() => {
          if (isLeaf) {
            onSelect(node.name);
          } else {
            onToggle(node.id);
          }
        }}
      >
        {!isLeaf && (
          <>
            {node.isOpen ? (
              <Icon icon="chevron-down" size={12} className="text-slate-400" />
            ) : (
              <Icon icon="chevron-right" size={12} className="text-slate-400" />
            )}
          </>
        )}
        <Icon
          icon={getNodeIcon()}
          size={12}
          className={isLeaf ? "text-blue-500" : "text-amber-500"}
        />
        <span
          className={isLeaf ? "text-slate-700" : "font-medium text-slate-800"}
        >
          {node.name}
        </span>
      </div>
      {node.isOpen && node.children && (
        <div>
          {node.children.map((child: any) => (
            <InternalTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SchemaConfigWorkspaceTab = () => {
  const [activeConfigTab, setActiveConfigTab] = useState<
    "runtime" | "network" | "mapping"
  >("runtime");

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="h-8 border-b border-slate-300 bg-slate-100 flex items-center justify-between px-3 shrink-0">
        <span className="text-[12px] font-semibold text-slate-700">
          Schema Configuration
        </span>
        <div className="flex items-center gap-2">
          <button className="h-6 px-3 text-[11px] border border-slate-400 bg-white hover:bg-slate-50 rounded-sm">
            Validate
          </button>
          <button className="h-6 px-3 text-[11px] border border-blue-700 bg-blue-600 text-white hover:bg-blue-700 rounded-sm">
            Apply Configuration
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-hidden flex gap-3">
        <div className="w-[40%] bg-white border border-slate-300 rounded-sm flex flex-col overflow-hidden">
          <div className="h-8 bg-slate-200 border-b border-slate-300 flex text-[11px]">
            {[
              { id: "runtime", label: "Runtime" },
              { id: "network", label: "Network" },
              { id: "mapping", label: "Data Mapping" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveConfigTab(tab.id as any)}
                className={`flex-1 border-r border-slate-300 last:border-r-0 ${
                  activeConfigTab === tab.id
                    ? "bg-white text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-3 text-xs overflow-y-auto">
            {activeConfigTab === "runtime" && (
              <div className="space-y-3">
                <div className="bg-slate-100 border border-slate-300 rounded-sm p-2">
                  Configure retry policies, log level, and batch behavior.
                </div>
                <label className="block text-slate-600">
                  maxRetries
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full mt-1 p-1.5 border border-slate-300 rounded-sm bg-white"
                  />
                </label>
              </div>
            )}
            {activeConfigTab === "network" && (
              <div className="space-y-3">
                <label className="block text-slate-600">
                  requestTimeoutInMs
                  <input
                    type="number"
                    defaultValue={15000}
                    className="w-full mt-1 p-1.5 border border-slate-300 rounded-sm bg-white"
                  />
                </label>
              </div>
            )}
            {activeConfigTab === "mapping" && (
              <div className="space-y-3">
                <div className="bg-sky-50 border border-sky-200 rounded-sm p-2 text-sky-800">
                  Mapping mode: upsert with primary key constraints.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white border border-slate-300 rounded-sm flex flex-col overflow-hidden">
          <div className="h-7 bg-slate-200 border-b border-slate-300 px-3 flex items-center justify-between text-[11px] text-slate-600">
            <span>schema_transform.production.json</span>
            <span>JSON</span>
          </div>
          <textarea
            className="flex-1 font-mono text-[11px] p-3 resize-none focus:outline-none bg-white text-slate-700"
            defaultValue={`{\n  "version": "1.2.0",\n  "environment": "production",\n  "maxRetries": 5,\n  "retryBackoffInMs": 2000,\n  "requestTimeoutInMs": 15000,\n  "batchSize": 500,\n  "enableIdempotency": true,\n  "enableSchemaValidation": true,\n  "enableDeadLetterQueue": true,\n  "logLevel": "INFO",\n  "defaultTargetDatabase": "mongo_prod_cluster"\n}`}
          />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAtlasEnabled, setIsAwsEnabled] = useState(true);

  const [trafficState, setTrafficState] = useState<
    "BLUE_POSTGRES" | "GREEN_MONGO"
  >("BLUE_POSTGRES");

  const [workspaceTabs, setWorkspaceTabs] = useState<string[]>(["Start Page"]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("Start Page");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [activeTableContext, setActiveTableContext] = useState("public.orders");
  const [diagramTables, setDiagramTables] = useState<TableDef[]>([]);

  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [treeData, setTreeData] = useState<FileNode[]>(DB_SCHEMA);

  // REMOVED: integrityProgress state
  // REMOVED: verificationResult state (and its rendering)

  const [advisoryState, setAdvisoryState] = useState<
    "neutral" | "ready" | "rollback"
  >("neutral");

  // REFACTORED: Effect to handle advisory state based on dummy drift result
  const handleIntegrityResult = (result: {
    source: string;
    target: string;
    drift: number;
  }) => {
    if (result.drift === 0) {
      setAdvisoryState("ready");
      addLog(
        "[SYSTEM ADVISORY]: Integrity Verified. Safe to switch traffic to GREEN.",
        "success",
      );
    } else {
      setAdvisoryState("rollback");
      addLog(
        "[SYSTEM ADVISORY]: Drift detected. Cutover NOT recommended.",
        "error",
      );
    }
  };


  const addLog = (msg: string, type: LogEntry["type"]) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        message: msg,
        type,
      },
    ]);
  };

  const runIntegrityProcess = (type: "verify" | "drift") => {
    // Provide immediate feedback in logs
    addLog(
      type === "verify"
        ? "AUDIT: Starting Merkle Tree verification..."
        : "AUDIT: Checking for drift...",
      "info",
    );

    // Simulate async process without progress bar
    setTimeout(() => {
      const drift = type === "drift" ? Math.floor(Math.random() * 2) : 0;

      const result = {
        source: "0xA91F23AB",
        target: drift === 0 ? "0xA91F23AB" : "0xFF12BC99",
        drift,
      };

      // Handle logic internally without setting state for UI display
      handleIntegrityResult(result);

      addLog(
        drift === 0
          ? "INTEGRITY VERIFIED: Merkle roots match."
          : "DRIFT DETECTED: Root hash mismatch.",
        drift === 0 ? "success" : "error",
      );
    }, 2000); // 2 second delay to simulate work
  };

  const handleOpenTab = (tabName: string) => {
    if (!workspaceTabs.includes(tabName)) {
      setWorkspaceTabs((prev) => [...prev, tabName]);
    }
    setActiveWorkspaceTab(tabName);
  };

  const handleObjectExplorerSelect = (itemName: string) => {
    if (
      itemName.includes("orders") ||
      itemName.includes("users") ||
      itemName.includes("inventory")
    ) {
      const tabName = `Live Map: ${itemName}`;
      setActiveTableContext(itemName);
      handleOpenTab(tabName);
    }
  };

  const toggleTreeNode = (id: string) => {
    const updateNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id) return { ...node, isOpen: !node.isOpen };
        if (node.children)
          return { ...node, children: updateNodes(node.children) };
        return node;
      });
    };
    setTreeData(updateNodes(treeData));
  };

  const collapseAllTreeNodes = () => {
    const collapseNodes = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => ({
        ...node,
        isOpen: false,
        ...(node.children ? { children: collapseNodes(node.children) } : {}),
      }));

    setTreeData(collapseNodes(treeData));
  };

  const refreshTreeNodes = () => {
    setTreeData(DB_SCHEMA);
    addLog("OBJECT EXPLORER: Refreshed.", "info");
  };

  // --- UPDATED SIMULATION LOOP with History ---
  useEffect(() => {
    let interval: number;
    if (isRunning && isConnected) {
      interval = setInterval(() => {
        const actions = [
          "Debezium: Captured 'INSERT' on table 'orders'",
          "Transform: Mapping Relational Row -> JSON",
          "Load: Performing Idempotent Upsert...",
          "Kafka: Committing offset...",
        ];
        const actionMsg = actions[Math.floor(Math.random() * actions.length)];
        addLog(actionMsg, "info");

      }, 1000); // Ticking every 1 second for smoother charts
    }
    return () => clearInterval(interval);
  }, [isRunning, isConnected]);

  const handleConnectClick = () => {
    if (isConnected) {
      setIsConnected(false);
      setIsRunning(false);
      setWorkspaceTabs((prev) => prev.filter((t) => t === "Start Page"));
      setActiveWorkspaceTab("Start Page");
    } else {
      setShowConnectDialog(true);
    }
  };

  const handleConfirmConnect = (selectedTables: string[]) => {
    setShowConnectDialog(false);
    setIsConnected(true);
    const nextDiagramTables = mapSelectedTablesToDiagram(selectedTables);
    setDiagramTables(nextDiagramTables);
    handleOpenTab("Monitor: PG -> Mongo -> Atlas");
    handleOpenTab("ERD Diagram");
    addLog("Connected to PostgreSQL, MongoDB Atlas, and MongoDB Atlas Storage.", "success");
  };

  const toggleRun = () => {
    if (!isConnected) return alert("Please connect first!");
    setIsRunning(!isRunning);
  };

  const killProcess = () => {
    setIsRunning(false);
    addLog("EMERGENCY HALT: User manually killed migration process.", "error");
  };

  const handleCutover = () => {
    const newState =
      trafficState === "BLUE_POSTGRES" ? "GREEN_MONGO" : "BLUE_POSTGRES";
    setTrafficState(newState);
    addLog(
      newState === "GREEN_MONGO"
        ? "CUTOVER: Traffic switched to Target."
        : "ROLLBACK: Traffic reverted to Source.",
      newState === "GREEN_MONGO" ? "success" : "error",
    );
  };

  const commands = {
    NEW_JOB: () => {
      setLogs([]);
      setIsRunning(false);
      addLog("NEW JOB INITIALIZED", "info");
    },

    CONNECT: handleConnectClick,

    REFRESH: () => {
      addLog("SYSTEM: Refreshing...", "info");
    },

    RUN: () => !isRunning && toggleRun(),
    PAUSE: () => isRunning && toggleRun(),
    KILL: killProcess,

    CUTOVER: handleCutover,

    VERIFY: () => runIntegrityProcess("verify"),
    DRIFT: () => runIntegrityProcess("drift"),

    CLEAR_LOGS: () => setLogs([]),

    OPEN_SCHEMA: () => handleOpenTab("Schema Configuration"),
    OPEN_DLQ: () => handleOpenTab("Dead Letter Queue"),
  };

  const menuContext = {
    isConnected,
    isRunning,
    trafficState,
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-200 overflow-hidden font-sans text-slate-900 selection:bg-blue-200 relative">
      {showConnectDialog && (
        <MigrationWizard
          onClose={() => setShowConnectDialog(false)}
          onFinish={handleConfirmConnect} // <--- Wire it here
        />
      )}

      {/* RIBBON — Narrow single-tier ribbon, all groups visible */}
      <div className="bg-slate-100 border-b border-slate-300 shadow-sm flex shrink-0">
        <div className="w-full">
          <MenuBar context={menuContext} commands={commands} />
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {showLeftPanel && (
          <div className="w-64 bg-[#F7F9FB] border-r border-slate-300 flex flex-col shrink-0 z-20">
            <div className="h-7 bg-[#EAF0F5] border-b border-slate-300 flex items-center px-2 justify-between">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-2">
                Object Explorer
              </span>
              <div className="flex items-center gap-1">
                <Icon icon="pin" size={12} className="text-slate-500 cursor-pointer" />
                <Icon
                  icon="cross"
                  size={12}
                  className="text-slate-500 cursor-pointer hover:text-red-500"
                  onClick={() => setShowLeftPanel(false)}
                />
              </div>
            </div>
            <div className="h-7 border-b border-slate-300 bg-white flex items-center px-1 gap-1">
              <button
                onClick={refreshTreeNodes}
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-slate-100"
                title="Refresh"
              >
                <Icon icon="refresh" size={12} className="text-slate-600" />
              </button>
              <button
                onClick={collapseAllTreeNodes}
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-slate-100"
                title="Collapse all"
              >
                <Icon icon="collapse-all" size={12} className="text-slate-600" />
              </button>
              <button
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-slate-100"
                title="Filter"
              >
                <Icon icon="filter-list" size={12} className="text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                  <Icon icon="linked-squares" size={32} />
                  <span className="text-xs mt-2">Not Connected</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {treeData.map((node) => (
                    <InternalTreeNode
                      key={node.id}
                      node={node}
                      level={0}
                      onToggle={toggleTreeNode}
                      onSelect={handleObjectExplorerSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          <div className="flex bg-slate-200 border-b border-slate-300 h-6 items-end px-1 gap-1 shrink-0">
            {workspaceTabs.map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveWorkspaceTab(tab)}
                className={`px-3 h-[23px] text-[11px] flex items-center gap-2 cursor-pointer select-none ${
                  activeWorkspaceTab === tab
                    ? "bg-slate-50 border-t border-l border-r border-slate-300 font-medium text-blue-700"
                    : "bg-slate-300 text-slate-600 hover:bg-slate-200 border-r border-slate-400/30"
                }`}
              >
                <span>{tab}</span>
                {tab !== "Start Page" && (
                  <Icon
                    icon="cross"
                    size={10}
                    className="hover:bg-slate-300 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkspaceTabs((prev) => prev.filter((t) => t !== tab));
                      if (activeWorkspaceTab === tab)
                        setActiveWorkspaceTab("Start Page");
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-white">
              {activeWorkspaceTab === "Start Page" && (
                <div className="h-full flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-light text-slate-400 mb-2">
                      G.R.A.S.Y.A.
                    </h1>
                    <p className="text-sm text-slate-500 mb-6">
                      Database Migration Suite
                    </p>
                    {!isConnected && (
                      <button
                        onClick={handleConnectClick}
                        className="text-xs px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Connect to Server
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "Monitor: PG -> Mongo -> Atlas" && (
                <MonitorView
                  logs={logs}
                  isRunning={isRunning}
                  isAtlasEnabled={isAtlasEnabled}
                  trafficState={trafficState}
                />
              )}

              {activeWorkspaceTab.startsWith("Live Map:") && (
                <SchemaMapTab
                  isRunning={isRunning}
                  tableName={activeTableContext}
                />
              )}

              {activeWorkspaceTab === "ERD Diagram" && (
                <DiagramPane tables={diagramTables} />
              )}

              {activeWorkspaceTab === "Dead Letter Queue" && (
                <DeadLetterQueueTab />
              )}

              {activeWorkspaceTab === "Schema Configuration" && (
                <SchemaConfigWorkspaceTab />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* STATUS BAR */}
      <div className="h-6 bg-blue-700 text-white flex items-center justify-between px-3 text-[11px] select-none shrink-0">
        <div className="flex gap-4">
          <span className="font-medium">
            {isConnected ? "Ready" : "Disconnected"}
          </span>
          {isRunning && (
            <span className="animate-pulse text-yellow-300">Migrating...</span>
          )}
          {isConnected && (
            <span
              className={
                trafficState === "BLUE_POSTGRES"
                  ? "text-blue-200"
                  : "text-green-300 font-bold"
              }
            >
              Traffic:{" "}
              {trafficState === "BLUE_POSTGRES"
                ? "Blue (Primary)"
                : "Green (Target)"}
            </span>
          )}
          {advisoryState !== "neutral" && (
            <span
              className={`ml-4 font-bold animate-pulse ${
                advisoryState === "ready" ? "text-green-300" : "text-red-300"
              }`}
            >
              {advisoryState === "ready"
                ? "READY FOR CUTOVER"
                : "ROLLBACK ADVISED"}
            </span>
          )}
        </div>
        <div className="flex gap-6 opacity-90">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>System: Operational</span>
        </div>
      </div>
    </div>
  );
}
