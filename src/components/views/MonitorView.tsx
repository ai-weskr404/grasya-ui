import React, { useRef, useEffect, useMemo, useState } from "react";
import { Icon } from "@blueprintjs/core";
import { Database20Filled } from "@fluentui/react-icons";
import type { LogEntry } from "../../types";

interface MonitorViewProps {
  logs: LogEntry[];
  isRunning: boolean;
  trafficState?: "BLUE_POSTGRES" | "GREEN_MONGO";
}

export const MonitorView: React.FC<MonitorViewProps> = ({
  logs,
  isRunning,
  trafficState = "BLUE_POSTGRES",
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [activePanelTab, setActivePanelTab] = useState<"terminal" | "logger">(
    "logger",
  );
  const deadLetterQueue = useMemo(
    () =>
      logs.filter(
        (log) =>
          log.type === "error" ||
          /\b(err(or)?|failed|failure|dead letter|retry exhausted)\b/i.test(
            log.message,
          ),
      ),
    [logs],
  );

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col h-full">
      {/* Diagram Section */}
      <div className="p-4 border-b border-slate-300">
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm flex items-center justify-between relative overflow-hidden gap-2">
          {/* BG Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#444 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />

          {/* 1. Source PG */}
          <div className="relative flex flex-col items-center gap-2 z-10 w-24">
            <div
              className={`
                w-12 h-12 bg-white border shadow-sm rounded flex items-center justify-center transition-all duration-500
                ${
                  trafficState === "BLUE_POSTGRES"
                    ? "border-blue-500 ring-4 ring-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105"
                    : "border-slate-300 opacity-60 grayscale-[0.5]"
                }
              `}
            >
              <Database20Filled
                className={
                  trafficState === "BLUE_POSTGRES"
                    ? "text-blue-600"
                    : "text-slate-400"
                }
              />
            </div>
            <div className="text-center">
              <div
                className={`text-[10px] font-bold ${trafficState === "BLUE_POSTGRES" ? "text-blue-700" : "text-slate-500"}`}
              >
                PostgreSQL
              </div>
              <div className="text-[9px] text-slate-400">Source</div>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="flex items-center gap-1 flex-1 justify-center z-10">
            <div
              className={`h-1 flex-1 bg-slate-300 rounded relative overflow-hidden`}
            >
              {isRunning && (
                <div className="absolute inset-0 bg-blue-400 animate-progress-indeterminate" />
              )}
            </div>
          </div>

          {/* NEW: KAFKA NODE (The "Central Nervous System") */}
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className="w-12 h-12 bg-white border border-slate-300 shadow-sm rounded flex items-center justify-center">
              {/* Fix: Pass the string "cube" directly */}
              <Icon icon="cube" className="text-purple-600" size={20} />
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold text-slate-700">Kafka</div>
              <div className="text-[9px] text-slate-500">Event Bus</div>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="flex items-center gap-1 flex-1 justify-center z-10">
            <div
              className={`h-1 flex-1 bg-slate-300 rounded relative overflow-hidden`}
            >
              {isRunning && (
                <div className="absolute inset-0 bg-blue-400 animate-progress-indeterminate" />
              )}
            </div>
          </div>

          {/* 2. Target Mongo */}
          <div className="relative flex flex-col items-center gap-2 z-10 w-24">
            <div
              className={`
                  w-12 h-12 bg-white border shadow-sm rounded flex items-center justify-center relative transition-all duration-500
                  ${
                    trafficState === "GREEN_MONGO"
                      ? "border-green-500 ring-4 ring-green-100 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105"
                      : "border-slate-300"
                  }
                `}
            >
              <Database20Filled
                className={
                  trafficState === "GREEN_MONGO"
                    ? "text-green-600"
                    : "text-slate-400"
                }
              />
              <div
                className={`
                   absolute -bottom-1 -right-1 text-[8px] px-1 rounded border transition-colors duration-500
                   ${
                     trafficState === "GREEN_MONGO"
                       ? "bg-green-100 text-green-700 border-green-200"
                       : "bg-slate-100 text-slate-400 border-slate-200"
                   }
                `}
              >
                NoSQL
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-[10px] font-bold ${trafficState === "GREEN_MONGO" ? "text-green-700" : "text-slate-500"}`}
              >
                MongoDB
              </div>
              <div className="text-[9px] text-slate-400">Transform</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex bg-slate-100 border-b border-slate-300 h-7 items-center px-2 gap-3 shrink-0">
          <div className="text-[11px] font-semibold text-slate-600">
            Migration Logs
          </div>
          <button
            className={`app-btn min-h-0 h-full rounded-none border-b-2 px-2 text-[11px] ${
              activePanelTab === "terminal"
                ? "border-orange-500 text-slate-800"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActivePanelTab("terminal")}
          >
            Terminal
          </button>
          <button
            className={`app-btn min-h-0 h-full rounded-none border-b-2 px-2 text-[11px] ${
              activePanelTab === "logger"
                ? "border-orange-500 text-slate-800"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActivePanelTab("logger")}
          >
            Logger
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed bg-white">
          {activePanelTab === "logger" &&
            logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50"
              >
                <span className="text-slate-400 select-none min-w-[60px]">
                  {log.timestamp}
                </span>
                <span
                  className={`
                  ${log.type === "error" ? "text-red-600" : ""}
                  ${log.type === "warning" ? "text-amber-600" : ""}
                  ${log.type === "success" ? "text-green-700" : ""}
                  ${log.type === "info" ? "text-slate-800" : ""}
                `}
                >
                  {log.type === "error" && "[ERR] "}
                  {log.message}
                </span>
              </div>
            ))}
          {activePanelTab === "terminal" && (
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">
                Dead Letter Queue
              </div>
              {deadLetterQueue.length === 0 ? (
                <div className="border border-green-200 bg-green-50 rounded p-3 text-green-700">
                  No dead letters currently.
                </div>
              ) : (
                deadLetterQueue.map((entry) => (
                  <div
                    key={`dlq-${entry.id}`}
                    className="border border-red-200 bg-red-50 rounded p-2"
                  >
                    <div className="text-red-700 font-semibold">
                      [{entry.timestamp}] {entry.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
