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

export interface TelemetryData {
  cpu: number;
  memory: number;
  throughput: number;
  upload: number;
}