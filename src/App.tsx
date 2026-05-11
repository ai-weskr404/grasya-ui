import { useState, useEffect, useRef } from "react";
import { Icon } from "@blueprintjs/core";
import Tree from "@rc-component/tree";
import "@rc-component/tree/assets/index.css";

import type { LogEntry, FileNode } from "./types";
import { INITIAL_LOGS, DB_SCHEMA } from "./data/mock-data";

import { MenuBar } from "./menu";
import DiagramPane from "./components/erd/DiagramPane";
import type { TableDef } from "./components/erd/types";
import {
  DEFAULT_ERD_SELECTED_TABLES,
  mapSelectedTablesToDiagram,
  normalizeSelectedTables,
  resolveDiagramTables,
} from "./components/erd/diagramData";
import { MigrationWizard } from "./components/modals/ConnectionDialog";
import {
  buildRelationshipMappings,
  type Cardinality,
  type MappingStrategy,
} from "./components/erd/relationshipMapping";
import { MonitorView } from "./components/views/MonitorView";

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

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAtlasEnabled] = useState(true);

  const [trafficState, setTrafficState] = useState<
    "BLUE_POSTGRES" | "GREEN_MONGO"
  >("BLUE_POSTGRES");

  const [workspaceTabs, setWorkspaceTabs] = useState<string[]>([
    "Start Page",
    "ERD Diagram",
  ]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("ERD Diagram");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [diagramTables, setDiagramTables] = useState<TableDef[]>(() =>
    mapSelectedTablesToDiagram([...DEFAULT_ERD_SELECTED_TABLES]),
  );
  const [showRelationshipPanel, setShowRelationshipPanel] = useState(false);
  const [activeRelationshipId, setActiveRelationshipId] = useState<
    string | null
  >(null);
  const [hoverRelationshipId, setHoverRelationshipId] = useState<string | null>(
    null,
  );
  const [mappingStrategyById, setMappingStrategyById] = useState<
    Record<string, MappingStrategy>
  >({});
  const [cardinalityOverrideById, setCardinalityOverrideById] = useState<
    Record<string, Cardinality>
  >({});
  const relationshipItemRefs = useRef<Record<string, HTMLDivElement | null>>(
    {},
  );
  const relationshipMappings = buildRelationshipMappings(diagramTables);
  const activeRelationship = relationshipMappings.find(
    (r) => r.id === (hoverRelationshipId ?? activeRelationshipId),
  );
  const highlightedNodeIds = activeRelationship
    ? [
        `${activeRelationship.sourceSchema}.${activeRelationship.sourceTable}`,
        `${activeRelationship.targetSchema}.${activeRelationship.targetTable}`,
      ]
    : [];

  useEffect(() => {
    if (!activeRelationshipId) return;
    relationshipItemRefs.current[activeRelationshipId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeRelationshipId]);

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


  useEffect(() => {
    if (!isConnected) {
      setWorkspaceTabs((prev) =>
        prev.filter((tab) => tab !== "ERD Diagram" || tab === "Start Page"),
      );
      setActiveWorkspaceTab("Start Page");
      setDiagramTables([]);
    }
  }, [isConnected]);

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

  const mapTreeData = (nodes: FileNode[]): any[] =>
    nodes.map((node) => ({
      key: node.id,
      title: node.name,
      nodeType: node.type,
      children: node.children ? mapTreeData(node.children) : undefined,
    }));

  const getExpandedKeys = (nodes: FileNode[]): string[] =>
    nodes.flatMap((node) => [
      ...(node.isOpen ? [node.id] : []),
      ...(node.children ? getExpandedKeys(node.children) : []),
    ]);

  const updateExpandedState = (
    nodes: FileNode[],
    expandedSet: Set<string>,
  ): FileNode[] =>
    nodes.map((node) => ({
      ...node,
      isOpen: expandedSet.has(node.id),
      ...(node.children
        ? { children: updateExpandedState(node.children, expandedSet) }
        : {}),
    }));

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

  const handleConfirmConnect = (selectedTables?: string[]) => {
    const normalizedSelectedTables = Array.isArray(selectedTables)
      ? normalizeSelectedTables(selectedTables)
      : [];
    const fallbackTables = [...DEFAULT_ERD_SELECTED_TABLES];
    const tablesForDiagram =
      normalizedSelectedTables.length > 0
        ? resolveDiagramTables(normalizedSelectedTables)
        : fallbackTables;

    setShowConnectDialog(false);
    setIsConnected(true);
    const nextDiagramTables = mapSelectedTablesToDiagram(tablesForDiagram);
    setDiagramTables(nextDiagramTables);
    handleOpenTab("Monitor: PG -> Mongo -> Atlas");
    setActiveWorkspaceTab("ERD Diagram");
    if (!workspaceTabs.includes("ERD Diagram")) {
      setWorkspaceTabs((prev) => [...prev, "ERD Diagram"]);
    }
    if (normalizedSelectedTables.length === 0) {
      addLog(
        "No tables selected in wizard. Loaded default PostgreSQL tables for the ERD view.",
        "warning",
      );
    }
    addLog(
      "Connected to PostgreSQL, MongoDB Atlas, and MongoDB Atlas Storage.",
      "success",
    );
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

    OPEN_SCHEMA: () => setShowRelationshipPanel((prev) => !prev),
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
                <Icon
                  icon="pin"
                  size={12}
                  className="text-slate-500 cursor-pointer"
                />
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
                <Icon
                  icon="collapse-all"
                  size={12}
                  className="text-slate-600"
                />
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
                <Tree
                  treeData={mapTreeData(treeData)}
                  expandedKeys={getExpandedKeys(treeData)}
                  selectable
                  showLine
                  showIcon
                  checkable
                  onExpand={(keys) => {
                    setTreeData(
                      updateExpandedState(treeData, new Set(keys as string[])),
                    );
                  }}
                  onCheck={() => {}}
                  onSelect={() => {}}
                  switcherIcon={({ expanded, isLeaf }: any) => (
                    isLeaf ? (
                      <span className="inline-block w-3 h-3 border border-slate-300 bg-white" />
                    ) : (
                      <span className="inline-flex items-center justify-center w-3 h-3 border border-slate-400 bg-white text-[10px] leading-none text-slate-600">
                        {expanded ? "-" : "+"}
                      </span>
                    )
                  )}
                  titleRender={(node: any) => (
                    <span className="text-[11px] text-slate-800 font-normal">
                      {String(node.title)}
                    </span>
                  )}
                />
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

              {activeWorkspaceTab === "ERD Diagram" && (
                <DiagramPane
                  tables={diagramTables}
                  highlightedNodeIds={highlightedNodeIds}
                  highlightedEdgeId={
                    hoverRelationshipId ?? activeRelationshipId
                  }
                  onRelationshipHover={setHoverRelationshipId}
                  onRelationshipSelect={setActiveRelationshipId}
                />
              )}

              {activeWorkspaceTab === "Dead Letter Queue" && (
                <DeadLetterQueueTab />
              )}
            </div>
          </div>
        </div>

        {showRelationshipPanel && (
          <div className="w-64 bg-[#F7F9FB] border-l border-slate-300 flex flex-col shrink-0 z-20">
            <div className="h-7 bg-[#EAF0F5] border-b border-slate-300 flex items-center px-2 justify-between">
              <span className="text-[11px] font-semibold text-slate-700">
                MongoDB Relationship Mapping
              </span>
              <Icon
                icon="cross"
                size={12}
                className="text-slate-500 cursor-pointer hover:text-red-500"
                onClick={() => setShowRelationshipPanel(false)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 pb-14 space-y-2">
              {relationshipMappings.map((rel) => {
                const isActive =
                  activeRelationshipId === rel.id ||
                  hoverRelationshipId === rel.id;
                return (
                  <div
                    ref={(el) => {
                      relationshipItemRefs.current[rel.id] = el;
                    }}
                    key={rel.id}
                    onMouseEnter={() => setHoverRelationshipId(rel.id)}
                    onMouseLeave={() => setHoverRelationshipId(null)}
                    onClick={() => setActiveRelationshipId(rel.id)}
                    className={`border rounded p-2 text-[11px] cursor-pointer ${isActive ? "border-sky-400 bg-sky-50" : "border-slate-300 bg-white"}`}
                  >
                    <div className="font-semibold text-slate-700">
                      {rel.sourceTable}.{rel.sourceColumn} → {rel.targetTable}.
                      {rel.targetColumn}
                    </div>
                    <div className="mt-2">
                      <label className="text-slate-500">MongoDB Mapping</label>
                      <select
                        className="w-full mt-1 border border-slate-300 rounded bg-white p-1"
                        value={mappingStrategyById[rel.id] ?? "referenced"}
                        onChange={(e) =>
                          setMappingStrategyById((prev) => ({
                            ...prev,
                            [rel.id]: e.target.value as MappingStrategy,
                          }))
                        }
                      >
                        <option value="embedded">Embedded document</option>
                        <option value="referenced">Referenced document</option>
                      </select>
                    </div>
                    <div className="mt-2 text-slate-600">
                      Detected:{" "}
                      <span className="font-semibold">
                        {rel.detectedCardinality}
                      </span>
                    </div>
                    <div className="mt-1">
                      <label className="text-slate-500">
                        Override Cardinality
                      </label>
                      <select
                        className="w-full mt-1 border border-slate-300 rounded bg-white p-1"
                        value={
                          cardinalityOverrideById[rel.id] ??
                          rel.detectedCardinality
                        }
                        onChange={(e) =>
                          setCardinalityOverrideById((prev) => ({
                            ...prev,
                            [rel.id]: e.target.value as Cardinality,
                          }))
                        }
                      >
                        <option value="1:1">1:1</option>
                        <option value="1:N">1:N</option>
                        <option value="N:1">N:1</option>
                        <option value="N:N">N:N</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mongo-rel-panel-footer sticky bottom-0 flex items-center justify-end gap-2 px-2 py-2">
              <button
                type="button"
                className="h-6 px-3 text-[10px] border border-slate-400 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-sm"
                onClick={() =>
                  addLog(
                    "RELATIONSHIP MAPPING: Discarded pending MongoDB relationship mapping changes.",
                    "warning",
                  )
                }
              >
                Discard
              </button>
              <button
                type="button"
                className="h-6 px-3 text-[10px] border border-blue-700 bg-blue-600 text-white hover:bg-blue-700 rounded-sm"
                onClick={() =>
                  addLog(
                    "RELATIONSHIP MAPPING: Applied MongoDB relationship mapping configuration.",
                    "success",
                  )
                }
              >
                Apply
              </button>
            </div>
          </div>
        )}
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
