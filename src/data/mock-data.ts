import type{ LogEntry, FileNode } from '../types';

export const INITIAL_LOGS: LogEntry[] = [
  { id: 1, timestamp: '10:00:01', message: 'System initialization started...', type: 'info' },
  { id: 2, timestamp: '10:00:02', message: 'Loading drivers: pg-native, mongodb-core, aws-sdk', type: 'info' },
  { id: 3, timestamp: '10:00:03', message: 'Waiting for connection...', type: 'info' },
];

export const DB_SCHEMA: FileNode[] = [
  {
    id: 'src', name: 'SRC_POSTGRES (Primary)', type: 'folder', isOpen: true, children: [
      { id: 's1', name: 'public', type: 'folder', isOpen: true, children: [
        { id: 't1', name: 'users', type: 'table' },
        { id: 't2', name: 'transactions', type: 'table' },
        { id: 't3', name: 'inventory_items', type: 'table' },
      ]},
      { id: 's2', name: 'catalog', type: 'folder', children: [] }
    ]
  },
  {
    id: 'tgt', name: 'TGT_MONGO (Atlas Cluster)', type: 'folder', isOpen: true, children: [
       { id: 'c1', name: 'grasya_analytics', type: 'folder', isOpen: true, children: [
          { id: 'd1', name: 'users_v2', type: 'view' },
          { id: 'd2', name: 'daily_tx_agg', type: 'view' }
       ] }
    ]
  },
  {
    id: 'cld', name: 'AWS_S3 (Data Lake)', type: 'folder', children: [
       { id: 'b1', name: 'bucket-grasya-prod', type: 'folder', children: [] }
    ]
  }
];