import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@blueprintjs/core";

export type MerkleValidationStatus = "PENDING" | "MATCH" | "MISMATCH";
export type PartitionLifecycleState = "STAGED" | "TRANSFORMING" | "COMPLETE";

export interface TelemetryLogEvent {
  id: number;
  ts: string;
  event: string;
  partitionState: PartitionLifecycleState;
  payload: Record<string, unknown>;
}

export interface TelemetryMetrics {
  merkleStatus: MerkleValidationStatus;
  partitionState: PartitionLifecycleState;
  replicationLagMs: number;
  pipelineErrorRate: number;
  dlqCount: number;
  requestSuccessRate: number;
  serviceAvailability: number;
  cutoverInterruptionTimeMs: number | null;
}

const MAX_LOG_ENTRIES = 400;
const LOG_FLUSH_MS = 250;

const statusBadgeClass: Record<MerkleValidationStatus, string> = {
  PENDING: "bg-slate-200 text-slate-700 border-slate-300",
  MATCH: "bg-green-100 text-green-800 border-green-300",
  MISMATCH: "bg-red-100 text-red-800 border-red-300",
};

interface TelemetryViewProps {
  isRunning: boolean;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ isRunning }) => {
  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    merkleStatus: "PENDING",
    partitionState: "STAGED",
    replicationLagMs: 12,
    pipelineErrorRate: 0,
    dlqCount: 0,
    requestSuccessRate: 100,
    serviceAvailability: 99.99,
    cutoverInterruptionTimeMs: null,
  });

  const [renderedLogs, setRenderedLogs] = useState<TelemetryLogEvent[]>([]);
  const logQueueRef = useRef<TelemetryLogEvent[]>([]);
  const logIdRef = useRef(1);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flusher = window.setInterval(() => {
      if (logQueueRef.current.length === 0) return;

      setRenderedLogs((prev) => {
        const merged = [...prev, ...logQueueRef.current];
        logQueueRef.current = [];
        return merged.slice(-MAX_LOG_ENTRIES);
      });
    }, LOG_FLUSH_MS);

    return () => window.clearInterval(flusher);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [renderedLogs.length]);

  useEffect(() => {
    if (!isRunning) return;

    const cycle = window.setInterval(() => {
      setMetrics((prev) => {
        const states: PartitionLifecycleState[] = [
          "STAGED",
          "TRANSFORMING",
          "COMPLETE",
        ];
        const nextState = states[(states.indexOf(prev.partitionState) + 1) % states.length];
        const nextMerkle: MerkleValidationStatus =
          nextState === "COMPLETE"
            ? Math.random() > 0.15
              ? "MATCH"
              : "MISMATCH"
            : "PENDING";

        const replicationLagMs = Math.max(0, prev.replicationLagMs + (Math.random() * 20 - 10));
        const pipelineErrorRate = Math.max(0, Math.min(5, prev.pipelineErrorRate + (Math.random() * 0.4 - 0.2)));
        const dlqCount = prev.dlqCount + (Math.random() > 0.93 ? 1 : 0);

        const nextMetrics: TelemetryMetrics = {
          ...prev,
          partitionState: nextState,
          merkleStatus: nextMerkle,
          replicationLagMs: Number(replicationLagMs.toFixed(1)),
          pipelineErrorRate: Number(pipelineErrorRate.toFixed(2)),
          dlqCount,
          requestSuccessRate: Number((99.4 + Math.random() * 0.6).toFixed(2)),
          serviceAvailability: Number((99.9 + Math.random() * 0.09).toFixed(3)),
        };

        logQueueRef.current.push({
          id: logIdRef.current++,
          ts: new Date().toISOString(),
          event: "pipeline.tick",
          partitionState: nextState,
          payload: {
            merkleStatus: nextMerkle,
            replicationLagMs: nextMetrics.replicationLagMs,
            pipelineErrorRate: nextMetrics.pipelineErrorRate,
            dlqCount: nextMetrics.dlqCount,
          },
        });

        return nextMetrics;
      });
    }, 1000);

    return () => window.clearInterval(cycle);
  }, [isRunning]);

  const merkleText = useMemo(() => metrics.merkleStatus, [metrics.merkleStatus]);

  return (
    <div className="h-full min-h-0 bg-slate-100 p-2">
      <div className="grid h-full min-h-0 grid-cols-[1fr_320px] grid-rows-[48px_1fr_150px] gap-2">
        <div className="col-span-2 flex items-center justify-between rounded border border-slate-300 bg-white px-3">
          <div className="flex items-center gap-2">
            <Icon icon="dashboard" size={14} className="text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">Telemetry Dashboard</span>
          </div>
          <div className={`rounded border px-3 py-1 text-xs font-semibold ${statusBadgeClass[metrics.merkleStatus]}`}>
            Merkle Validation: {merkleText}
          </div>
        </div>

        <div className="row-start-2 rounded border border-slate-300 bg-white min-h-0 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-700">Active Migration Status</span>
            <span className="text-[11px] text-slate-600">Partition State: <strong>{metrics.partitionState}</strong></span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-950 p-2 font-mono text-[11px] text-emerald-200">
            {renderedLogs.map((log) => (
              <div key={log.id} className="border-b border-slate-800 py-0.5 last:border-0">
                {JSON.stringify(log)}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="row-start-2 rounded border border-slate-300 bg-white min-h-0">
          <div className="border-b border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">Relative Zero-Downtime Benchmarks</div>
          <div className="space-y-3 p-3 text-sm">
            <div>Request Success Rate (RSR): <strong>{metrics.requestSuccessRate.toFixed(2)}%</strong></div>
            <div>Service Availability (SA): <strong>{metrics.serviceAvailability.toFixed(3)}%</strong></div>
            <div>Cutover Interruption Time (CIT): <strong>{metrics.cutoverInterruptionTimeMs ?? 0} ms</strong></div>
          </div>
        </div>

        <div className="col-span-2 row-start-3 rounded border border-slate-300 bg-white">
          <div className="border-b border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">Pipeline Health & Synchronization</div>
          <div className="grid h-[calc(100%-30px)] grid-cols-2 gap-3 p-3 text-sm">
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              End-to-End Replication Lag (L): <strong>{metrics.replicationLagMs.toFixed(1)} ms</strong>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              Pipeline Error Rate (PER) / DLQ Count: <strong>{metrics.pipelineErrorRate.toFixed(2)}%</strong> / <strong>{metrics.dlqCount}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
