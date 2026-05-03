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

// src/types.ts update
export interface TelemetryData {
  cpu: number;
  memory: number;
  throughput: number;
  latency: number; // NFR-01
  integrityScore: number; // FR-04
}

export type TrafficState = 'BLUE_POSTGRES' | 'GREEN_MONGO'; // FR-05