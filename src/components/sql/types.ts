export type BackendProvider = "postgres" | "mysql" | "mariadb" | "sqlite" | "oracle" | "mssql" | "mock";

export interface TableIdentifier {
  backend: BackendProvider;
  schema?: string;
  table: string;
  label: string;
}

export interface TableColumnMeta {
  field: string;
  headerName: string;
  dataType: string;
}

export interface TableRowsRequest {
  table: TableIdentifier;
  startRow: number;
  endRow: number;
  sortModel?: Array<{ colId: string; sort: "asc" | "desc" }>;
  filterModel?: Record<string, unknown>;
}

export interface TableRowsResponse {
  rows: Record<string, unknown>[];
  lastRow: number;
}

export interface BackendAdapter {
  getTables(): Promise<TableIdentifier[]>;
  getTableColumns(table: TableIdentifier): Promise<TableColumnMeta[]>;
  getTableRows(request: TableRowsRequest, signal?: AbortSignal): Promise<TableRowsResponse>;
}
