import { useState, useEffect, useRef } from "react";
import {
  Database,
  Play,
  Pause,
  Square,
  Save,
  FileText,
  RefreshCw,
  Server,
  ShieldCheck,
  Search,
  X,
  Network,
  Settings,
  Eraser,
  AlertOctagon,
  FileJson,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Table as TableIcon,
  Cpu,
  Activity,
  Zap,
} from "lucide-react";

// Import Recharts for the new UI
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import type { LogEntry, FileNode } from "./types";
import { INITIAL_LOGS, DB_SCHEMA } from "./data/mock-data";

import { RibbonGroup, RibbonBtn } from "./components/ui/Ribbon";
import { ConnectionDialog } from "./components/modals/ConnectionDialog";
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

// --- COMPONENT: New Telemetry Panel with Graphs ---
const TelemetryPanel = ({ telemetry, history, trafficState, onClose }: any) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pieData = [
    { name: "Inserts", value: 65, color: "#16a34a" },
    { name: "Updates", value: 25, color: "#3b82f6" },
    { name: "Deletes", value: 10, color: "#ef4444" },
  ];

  return (
    <div
      className={`bg-slate-50 border-l border-slate-300 shadow-xl z-30 transition-all duration-300
      ${isCollapsed ? "w-8" : "w-[240px]"} 
      flex flex-col`}
    >
      {/* HEADER */}
      <div className="h-6 bg-slate-200 border-b border-slate-300 flex items-center justify-between px-2 shrink-0">
        {!isCollapsed && (
          <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
            <Activity size={11} className="text-blue-600" />
            Telemetry
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-500 hover:text-slate-800"
          >
            {isCollapsed ? (
              <ChevronLeft size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </button>

          {!isCollapsed && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-500"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col justify-between p-2 gap-2 overflow-hidden">
          {/* NODE RESOURCES */}
          <div className="bg-white border p-2 rounded shadow-sm">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
              <span>Resources</span>
              <Cpu size={10} />
            </div>

            <div className="h-16 w-full mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <YAxis domain={[0, 100]} hide />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fillOpacity={0.15}
                    fill="#3b82f6"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between text-[9px] font-mono">
              <span>CPU: {telemetry.cpu}%</span>
              <span>MEM: {telemetry.memory}%</span>
            </div>
          </div>

          {/* EVENT MIX */}
          <div className="bg-white border p-2 rounded shadow-sm">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
              <span>Events</span>
              <FileJson size={10} />
            </div>

            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={18}
                    outerRadius={28}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LATENCY */}
          <div className="bg-white border p-2 rounded shadow-sm">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
              <span>Lag</span>
              <Zap size={10} />
            </div>

            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <Line
                    type="step"
                    dataKey="latency"
                    stroke={telemetry.latency > 50 ? "#ef4444" : "#16a34a"}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <YAxis hide domain={[0, "auto"]} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-right text-sm font-mono">
              {telemetry.latency}ms
            </div>
          </div>

          {/* ROUTING */}
          <div
            className={`border p-2 rounded flex items-center gap-2 text-[9px]
            ${
              trafficState === "BLUE_POSTGRES"
                ? "bg-blue-50 border-blue-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <Network size={12} />
            <span className="font-bold">
              {trafficState === "BLUE_POSTGRES"
                ? "Blue (Source)"
                : "Green (Target)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
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
            <Database className="text-blue-600" size={18} />
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
                        SENT
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

// --- FEATURE: Config View ---
// --- FEATURE: Config View ---
const ConfigViewTab = () => (
  <div className="p-6 h-full flex flex-col bg-slate-50">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Settings size={18} className="text-slate-600" /> Schema Configuration
        </h2>
      </div>
      <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 shadow-sm transition-colors">
        <Save size={12} /> Apply Configuration
      </button>
    </div>

    <div className="flex-1 flex gap-4 overflow-hidden">
      {/* LEFT PANEL — ENTERPRISE SETTINGS */}
      <div className="w-1/3 bg-white border border-slate-300 rounded shadow-sm p-4 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-700 uppercase mb-4 border-b pb-2">
          Global Runtime Settings
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-600 block mb-1">
              Naming Convention Strategy
            </label>
            <select className="w-full p-2 border border-slate-200 rounded bg-slate-50">
              <option>snake_case (user_id)</option>
              <option>camelCase (userId)</option>
              <option>PascalCase (UserId)</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              maxRetries
            </label>
            <input
              type="number"
              defaultValue={5}
              className="w-full p-2 border border-slate-200 rounded bg-slate-50"
            />
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              retryBackoffInMs
            </label>
            <input
              type="number"
              defaultValue={2000}
              className="w-full p-2 border border-slate-200 rounded bg-slate-50"
            />
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              requestTimeoutInMs
            </label>
            <input
              type="number"
              defaultValue={15000}
              className="w-full p-2 border border-slate-200 rounded bg-slate-50"
            />
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              batchSize
            </label>
            <input
              type="number"
              defaultValue={500}
              className="w-full p-2 border border-slate-200 rounded bg-slate-50"
            />
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              enableIdempotency
            </label>
            <select className="w-full p-2 border border-slate-200 rounded bg-slate-50">
              <option>true</option>
              <option>false</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              enableSchemaValidation
            </label>
            <select className="w-full p-2 border border-slate-200 rounded bg-slate-50">
              <option>true</option>
              <option>false</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              logLevel
            </label>
            <select className="w-full p-2 border border-slate-200 rounded bg-slate-50">
              <option>INFO</option>
              <option>DEBUG</option>
              <option>WARN</option>
              <option>ERROR</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              enableDeadLetterQueue
            </label>
            <select className="w-full p-2 border border-slate-200 rounded bg-slate-50">
              <option>true</option>
              <option>false</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              defaultTargetDatabase
            </label>
            <input
              type="text"
              defaultValue="mongo_prod_cluster"
              className="w-full p-2 border border-slate-200 rounded bg-slate-50"
            />
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              themeSelection
            </label>
            <select className="w-full p-2 border border-slate-200 rounded bg-slate-50">
              <option>light</option>
              <option>dark</option>
              <option>system</option>
            </select>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — REALISTIC TRANSFORM CONFIG */}
      <div className="flex-1 bg-slate-900 rounded shadow-inner flex flex-col border border-slate-700 overflow-hidden">
        <div className="bg-slate-800 px-4 py-1 text-[10px] text-slate-400 flex justify-between border-b border-slate-700">
          <span>schema_transform.production.json</span>
          <span>JSON</span>
        </div>

        <textarea
          className="flex-1 bg-transparent text-green-400 font-mono text-[11px] p-4 focus:outline-none resize-none leading-relaxed"
          defaultValue={`{
  "version": "1.2.0",
  "environment": "production",
  "maxRetries": 5,
  "retryBackoffInMs": 2000,
  "requestTimeoutInMs": 15000,
  "batchSize": 500,
  "enableIdempotency": true,
  "enableSchemaValidation": true,
  "enableDeadLetterQueue": true,
  "logLevel": "INFO",
  "defaultTargetDatabase": "mongo_prod_cluster",
  "collections": [
    {
      "source": "public.orders",
      "target": "orders",
      "primaryKey": "id",
      "operationMode": "upsert",
      "fieldMappings": {
        "order_id": "orderId",
        "user_id": "userId",
        "total_amount": "totalAmount",
        "created_at": "createdAt",
        "updated_at": "updatedAt",
        "order_status": "status"
      }
    },
    {
      "source": "public.users",
      "target": "users",
      "primaryKey": "id",
      "operationMode": "upsert",
      "fieldMappings": {
        "first_name": "firstName",
        "last_name": "lastName",
        "email_address": "email",
        "created_at": "createdAt"
      }
    }
  ]
}`}
        />
      </div>
    </div>
  </div>
);

// --- REUSED: Dead Letter Queue ---
const DeadLetterQueueTab = () => (
  <div className="p-6 h-full flex flex-col bg-slate-50">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
          <AlertOctagon size={18} /> Dead Letter Queue (DLQ)
        </h2>
      </div>
    </div>
    <div className="border border-red-200 rounded bg-white shadow-sm flex-1 overflow-auto">
      <table className="w-full text-left text-[11px]">
        <thead className="bg-red-50 text-red-900 border-b border-red-100">
          <tr>
            <th className="p-2 font-bold">Timestamp</th>
            <th className="p-2 font-bold">Topic</th>
            <th className="p-2 font-bold">Error</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 text-slate-500">10:42:15.002</td>
            <td className="p-2 font-mono">db.server1.inventory</td>
            <td className="p-2 text-red-600 font-medium">Validation Failed</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// --- COMPONENT: Internal Tree Node ---
const InternalTreeNode = ({ node, level, onToggle, onSelect }: any) => {
  const isLeaf = !node.children;
  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-slate-100 text-[11px] ${
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
        {isLeaf ? (
          <TableIcon size={12} className="text-blue-500" />
        ) : (
          <>
            {node.isOpen ? (
              <ChevronDown size={12} className="text-slate-400" />
            ) : (
              <ChevronRight size={12} className="text-slate-400" />
            )}
            <Database size={12} className="text-amber-500" />
          </>
        )}
        <span
          className={isLeaf ? "text-slate-700" : "font-semibold text-slate-800"}
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

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "home" | "migration" | "integrity" | "view"
  >("home");
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAwsEnabled, setIsAwsEnabled] = useState(true);

  const [trafficState, setTrafficState] = useState<
    "BLUE_POSTGRES" | "GREEN_MONGO"
  >("BLUE_POSTGRES");

  const [workspaceTabs, setWorkspaceTabs] = useState<string[]>(["Start Page"]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("Start Page");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeTableContext, setActiveTableContext] = useState("public.orders");

  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [treeData, setTreeData] = useState<FileNode[]>(DB_SCHEMA);

  // --- NEW: History State for Graphs ---
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState({
    cpu: 12,
    memory: 45,
    throughput: 0,
    latency: 2,
  });

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

  const handleVerifyIntegrity = () => {
    if (!isConnected) return alert("System offline.");
    addLog("INITIATING RECONCILIATION SERVICE...", "info");
    setTimeout(
      () => addLog("INTEGRITY CONFIRMED: Merkle Roots Match.", "success"),
      2800,
    );
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

        const newCpu = Math.floor(Math.random() * 30) + 20;
        const newMem = Math.floor(Math.random() * 20) + 40;
        const newLatency = Math.floor(Math.random() * 50) + 5;

        // Update Scalar
        setTelemetry({
          cpu: newCpu,
          memory: newMem,
          throughput: Math.floor(Math.random() * 500) + 1000,
          latency: newLatency,
        });

        // Update History (Keep last 20 points)
        setTelemetryHistory((prev) => {
          const now = new Date();
          const timeLabel = `${now.getSeconds()}s`;
          const newData = {
            time: timeLabel,
            cpu: newCpu,
            memory: newMem,
            latency: newLatency,
          };
          const newHistory = [...prev, newData];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
      }, 1000); // Ticking every 1 second for smoother charts
    } else {
      setTelemetry({ cpu: 5, memory: 15, throughput: 0, latency: 0 });
    }
    return () => clearInterval(interval);
  }, [isRunning, isConnected]);

  const handleConnectClick = () => {
    if (isConnected) {
      setIsConnected(false);
      setIsRunning(false);
      setWorkspaceTabs((prev) => prev.filter((t) => t === "Start Page"));
      setActiveWorkspaceTab("Start Page");
      setTelemetryHistory([]); // Clear history
    } else {
      setShowConnectDialog(true);
    }
  };

  const handleConfirmConnect = () => {
    setShowConnectDialog(false);
    setIsConnected(true);
    handleOpenTab("Monitor: PG -> Mongo -> AWS");
    addLog("Connected to PostgreSQL, MongoDB Atlas, and AWS S3.", "success");
  };

  const toggleRun = () => {
    if (!isConnected) return alert("Please connect first!");
    setIsRunning(!isRunning);
  };

  const killProcess = () => {
    setIsRunning(false);
    addLog("EMERGENCY HALT: User manually killed migration process.", "error");
    setTelemetry((prev) => ({ ...prev, throughput: 0, latency: 9999 }));
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

  const renderRibbonContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <RibbonGroup label="Server">
              <RibbonBtn
                icon={isConnected ? Square : Server}
                label={isConnected ? "Disconnect" : "Connect"}
                onClick={handleConnectClick}
                color={isConnected ? "text-red-600" : "text-slate-700"}
              />
              <div className="flex flex-col gap-1">
                <RibbonBtn icon={RefreshCw} label="Refresh" variant="small" />
                <RibbonBtn
                  icon={Settings}
                  label="Global Opts"
                  variant="small"
                />
              </div>
            </RibbonGroup>
            <RibbonGroup label="Definition">
              <RibbonBtn icon={FileText} label="New Job" />
              <RibbonBtn icon={Save} label="Save Meta" variant="large" />
            </RibbonGroup>
          </>
        );
      case "migration":
        return (
          <>
            <RibbonGroup label="Execution">
              <RibbonBtn
                icon={Play}
                label="Execute"
                onClick={() => !isRunning && toggleRun()}
                active={isRunning}
                color="text-green-600"
              />
              <RibbonBtn
                icon={Pause}
                label="Pause"
                onClick={() => isRunning && toggleRun()}
                color="text-amber-600"
              />
              <RibbonBtn
                icon={Square}
                label="Kill"
                color="text-red-600"
                onClick={killProcess}
              />
            </RibbonGroup>
            <RibbonGroup label="Traffic Control">
              <RibbonBtn
                icon={Network}
                label={
                  trafficState === "BLUE_POSTGRES"
                    ? "Cutover (Green)"
                    : "Rollback (Blue)"
                }
                color={
                  trafficState === "BLUE_POSTGRES"
                    ? "text-green-600"
                    : "text-red-600"
                }
                onClick={handleCutover}
              />
            </RibbonGroup>
          </>
        );
      case "integrity":
        return (
          <RibbonGroup label="Audit">
            <RibbonBtn
              icon={ShieldCheck}
              label="Verify"
              onClick={handleVerifyIntegrity}
            />
            <RibbonBtn icon={Search} label="Drift Check" />
          </RibbonGroup>
        );
      case "view":
        return (
          <RibbonGroup label="Panels">
            <RibbonBtn
              icon={Eraser}
              label="Clear Logs"
              onClick={() => setLogs([])}
            />
            <RibbonBtn
              icon={FileJson}
              label="Schema Config"
              onClick={() => handleOpenTab("Schema Config")}
            />
            <RibbonBtn
              icon={AlertOctagon}
              label="Dead Letters"
              onClick={() => handleOpenTab("Dead Letter Queue")}
              color="text-red-600"
            />
          </RibbonGroup>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-200 overflow-hidden font-sans text-slate-900 selection:bg-blue-200 relative">
      <ConnectionDialog
        show={showConnectDialog}
        onClose={() => setShowConnectDialog(false)}
        onConfirm={handleConfirmConnect}
        isAwsEnabled={isAwsEnabled}
        setIsAwsEnabled={setIsAwsEnabled}
      />

      {/* TOP BAR */}
      <div className="h-8 bg-slate-900 flex items-center px-4 justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          <Database className="text-blue-400 w-4 h-4" />
          <span className="text-xs text-slate-200 font-semibold tracking-wide">
            G.R.A.S.Y.A. Enterprise Manager{" "}
            {isConnected
              ? "- [PostgreSQL -> Mongo -> AWS]"
              : "- [No Connection]"}
          </span>
        </div>
        <div className="flex gap-4">
          <div className="w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500"></div>
          <div className="w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500"></div>
          <div className="w-3 h-3 rounded-full bg-red-900 hover:bg-red-600"></div>
        </div>
      </div>

      {/* RIBBON */}
      <div className="bg-slate-100 border-b border-slate-300 shadow-sm flex flex-col shrink-0">
        <div className="flex px-2 pt-1 gap-1 border-b border-slate-300 bg-slate-50">
          {["Home", "Migration", "Integrity", "View"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as any)}
              className={`px-5 py-1 text-[12px] rounded-t-sm transition-colors border-t border-l border-r ${
                activeTab === tab.toLowerCase()
                  ? "bg-slate-100 border-slate-300 border-b-slate-100 font-medium text-blue-900 relative top-[1px] z-10"
                  : "bg-transparent border-transparent text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="h-24 bg-slate-100 flex items-center px-2 py-2 overflow-x-auto">
          {renderRibbonContent()}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {showLeftPanel && (
          <div className="w-64 bg-white border-r border-slate-300 flex flex-col shrink-0 z-20">
            <div className="h-6 bg-slate-100 border-b border-slate-300 flex items-center px-2 justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-2">
                Object Explorer
              </span>
              <X
                size={12}
                className="text-slate-400 cursor-pointer hover:text-red-500"
                onClick={() => setShowLeftPanel(false)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                  <Server size={32} strokeWidth={1} />
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
                  <X
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

              {activeWorkspaceTab === "Monitor: PG -> Mongo -> AWS" && (
                <MonitorView
                  logs={logs}
                  isRunning={isRunning}
                  isAwsEnabled={isAwsEnabled}
                  trafficState={trafficState}
                />
              )}

              {activeWorkspaceTab.startsWith("Live Map:") && (
                <SchemaMapTab
                  isRunning={isRunning}
                  tableName={activeTableContext}
                />
              )}

              {activeWorkspaceTab === "Dead Letter Queue" && (
                <DeadLetterQueueTab />
              )}
              {activeWorkspaceTab === "Schema Config" && <ConfigViewTab />}
            </div>

            {/* RIGHT PANEL: TELEMETRY (Replaced with new Component) */}
            {isConnected &&
              activeWorkspaceTab !== "Start Page" &&
              showRightPanel && (
                <TelemetryPanel
                  telemetry={telemetry}
                  history={telemetryHistory}
                  trafficState={trafficState}
                  onClose={() => setShowRightPanel(false)}
                />
              )}
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
            <span className="animate-pulse text-yellow-300">
              ● Migrating...
            </span>
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
        </div>
        <div className="flex gap-6 opacity-90">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>Latency: {isConnected ? `${telemetry.latency}ms` : "-"}</span>
        </div>
      </div>
    </div>
  );
}
