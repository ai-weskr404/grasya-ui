export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'table' | 'view' | 'proc';
  children?: FileNode[];
  isOpen?: boolean;
}

export type TrafficState = 'BLUE_POSTGRES' | 'GREEN_MONGO';


export type MerkleValidationStatus = "PENDING" | "MATCH" | "MISMATCH";
export type PartitionLifecycleState = "STAGED" | "TRANSFORMING" | "COMPLETE";

export interface TelemetryLogEvent {
  id: string;
  ts: string;
  level: "info" | "warning" | "error";
  event: string;
  payload: Record<string, unknown>;
}

export interface TelemetryFrame {
  timestamp: number;
  integrity: {
    merkleValidationStatus: MerkleValidationStatus;
  };
  execution: {
    partitionLifecycleState: PartitionLifecycleState;
  };
  pipeline: {
    replicationLagMs: number;
    pipelineErrorRatePct: number;
    dlqCount: number;
  };
  benchmarks: {
    requestSuccessRatePct: number;
    serviceAvailabilityPct: number;
    cutoverInterruptionTimeMs: number | null;
  };
  logEvent: TelemetryLogEvent;
}
