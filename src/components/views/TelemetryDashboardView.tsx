import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@blueprintjs/core";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type {
  MerkleValidationStatus,
  PartitionLifecycleState,
  TelemetryFrame,
  TelemetryLogEvent,
} from "../../types";

interface TelemetryDashboardViewProps {
  isRunning: boolean;
}

const LOG_CAP = 300;
const CHART_CAP = 90;

const statusClass: Record<MerkleValidationStatus, string> = {
  PENDING: "bg-slate-200 text-slate-700 border-slate-300",
  MATCH: "bg-green-100 text-green-800 border-green-300",
  MISMATCH: "bg-red-100 text-red-800 border-red-300",
};

const lifecycleClass: Record<PartitionLifecycleState, string> = {
  STAGED: "bg-slate-100 text-slate-700 border-slate-300",
  TRANSFORMING: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETE: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export const TelemetryDashboardView: React.FC<TelemetryDashboardViewProps> = ({
  isRunning,
}) => {
  const [frame, setFrame] = useState<TelemetryFrame>({
    timestamp: Date.now(),
    integrity: { merkleValidationStatus: "PENDING" },
    execution: { partitionLifecycleState: "STAGED" },
    pipeline: { replicationLagMs: 0, pipelineErrorRatePct: 0, dlqCount: 0 },
    benchmarks: { requestSuccessRatePct: 100, serviceAvailabilityPct: 100, cutoverInterruptionTimeMs: null },
    logEvent: {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      level: "info",
      event: "telemetry.init",
      payload: { phase: "STAGED" },
    },
  });

  const [logs, setLogs] = useState<TelemetryLogEvent[]>([]);
  const [lagTrend, setLagTrend] = useState<Array<{ idx: number; lag: number }>>([]);
  const nextIdx = useRef(0);
  const logScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logScrollerRef.current?.scrollTo({ top: logScrollerRef.current.scrollHeight, behavior: "auto" });
  }, [logs]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      const cycle = nextIdx.current;
      const phase: PartitionLifecycleState = cycle % 24 < 6 ? "STAGED" : cycle % 24 < 19 ? "TRANSFORMING" : "COMPLETE";
      const merkle: MerkleValidationStatus = phase === "COMPLETE" ? (cycle % 7 === 0 ? "MISMATCH" : "MATCH") : "PENDING";
      const replicationLagMs = Math.max(2, Math.round(40 + Math.random() * 250 + (phase === "TRANSFORMING" ? 120 : 0)));
      const dlqCount = cycle % 13 === 0 ? Math.floor(Math.random() * 5) : 0;
      const pipelineErrorRatePct = Number((dlqCount > 0 ? Math.random() * 1.6 : Math.random() * 0.2).toFixed(2));
      const requestSuccessRatePct = Number((99.95 - pipelineErrorRatePct * 0.15).toFixed(3));
      const serviceAvailabilityPct = Number((99.99 - pipelineErrorRatePct * 0.05).toFixed(3));
      const cutoverInterruptionTimeMs = phase === "COMPLETE" ? Math.round(Math.random() * 120) : null;

      const logEvent: TelemetryLogEvent = {
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        level: dlqCount > 0 ? "warning" : merkle === "MISMATCH" ? "error" : "info",
        event: "pipeline.tick",
        payload: {
          phase,
          merkle,
          replicationLagMs,
          pipelineErrorRatePct,
          dlqCount,
        },
      };

      setFrame({
        timestamp: Date.now(),
        integrity: { merkleValidationStatus: merkle },
        execution: { partitionLifecycleState: phase },
        pipeline: { replicationLagMs, pipelineErrorRatePct, dlqCount },
        benchmarks: { requestSuccessRatePct, serviceAvailabilityPct, cutoverInterruptionTimeMs },
        logEvent,
      });

      setLogs((prev) => [...prev, logEvent].slice(-LOG_CAP));
      setLagTrend((prev) => [...prev, { idx: nextIdx.current, lag: replicationLagMs }].slice(-CHART_CAP));
      nextIdx.current += 1;
    }, 900);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  const logLines = useMemo(
    () => logs.map((entry) => JSON.stringify(entry)),
    [logs],
  );

  return (
    <div className="h-full min-h-0 bg-slate-100 p-2">
      <div className="h-full min-h-0 grid grid-cols-[1fr_320px] grid-rows-[48px_1fr_190px] gap-2">
        <header className="col-span-2 bg-white border border-slate-300 rounded-sm px-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Telemetry Dashboard</h2>
            <span className={`text-[11px] font-semibold px-2 py-1 rounded border ${statusClass[frame.integrity.merkleValidationStatus]}`}>
              Merkle Validation: {frame.integrity.merkleValidationStatus}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">{new Date(frame.timestamp).toLocaleTimeString("en-US", { hour12: false })} UTC</span>
        </header>

        <section className="bg-white border border-slate-300 rounded-sm min-h-0 flex flex-col">
          <div className="h-8 px-3 border-b border-slate-200 text-[11px] flex items-center justify-between">
            <span className="font-semibold text-slate-700">Active Migration Execution</span>
            <span className={`px-2 py-0.5 rounded border font-semibold ${lifecycleClass[frame.execution.partitionLifecycleState]}`}>
              {frame.execution.partitionLifecycleState}
            </span>
          </div>
          <div ref={logScrollerRef} className="flex-1 min-h-0 overflow-auto bg-[#0f172a] text-[11px] leading-5 p-2 font-mono text-slate-100">
            {logLines.map((line, idx) => (
              <div key={`${idx}-${line.slice(0, 24)}`} className="border-b border-slate-800/40">
                {line}
              </div>
            ))}
          </div>
        </section>

        <aside className="bg-white border border-slate-300 rounded-sm min-h-0 flex flex-col">
          <div className="h-8 px-3 border-b border-slate-200 text-[11px] flex items-center font-semibold text-slate-700">Relative Zero-Downtime Benchmarks</div>
          <div className="p-3 text-[12px] space-y-2">
            <MetricRow label="Request Success Rate (RSR)" value={`${frame.benchmarks.requestSuccessRatePct.toFixed(3)}%`} />
            <MetricRow label="Service Availability (SA)" value={`${frame.benchmarks.serviceAvailabilityPct.toFixed(3)}%`} />
            <MetricRow label="Cutover Interruption Time (CIT)" value={frame.benchmarks.cutoverInterruptionTimeMs === null ? "null" : `${frame.benchmarks.cutoverInterruptionTimeMs} ms`} />
          </div>
        </aside>

        <section className="col-span-2 bg-white border border-slate-300 rounded-sm min-h-0 flex flex-col">
          <div className="h-8 px-3 border-b border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-2">
            <Icon icon="timeline-events" size={12} /> Pipeline Health & Synchronization
          </div>
          <div className="grid grid-cols-[220px_220px_1fr] gap-3 p-3 min-h-0">
            <MetricBlock label="End-to-End Replication Lag (L)" value={`${frame.pipeline.replicationLagMs} ms`} />
            <MetricBlock label="Pipeline Error Rate (PER) / DLQ Count" value={`${frame.pipeline.pipelineErrorRatePct.toFixed(2)}% / ${frame.pipeline.dlqCount}`} />
            <div className="border border-slate-200 rounded p-2 min-h-[120px]">
              <div className="text-[11px] text-slate-500 mb-1">Replication Lag Trend</div>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={lagTrend}>
                  <XAxis dataKey="idx" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={35} />
                  <Tooltip />
                  <Line dataKey="lag" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-slate-200 rounded px-2 py-1.5">
    <div className="text-slate-500 text-[10px]">{label}</div>
    <div className="text-slate-800 font-semibold">{value}</div>
  </div>
);

const MetricBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-slate-200 rounded p-2">
    <div className="text-[10px] text-slate-500">{label}</div>
    <div className="text-[20px] font-semibold text-slate-800 mt-1">{value}</div>
  </div>
);
