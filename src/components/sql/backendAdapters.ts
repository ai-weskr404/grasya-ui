import { DB_SCHEMA } from "../../data/mock-data";
import type { BackendAdapter, TableColumnMeta, TableIdentifier, TableRowsRequest, TableRowsResponse } from "./types";

const DEBUG_COLUMNS: TableColumnMeta[] = [
  { field: "id", headerName: "id", dataType: "integer" },
  { field: "name", headerName: "name", dataType: "text" },
  { field: "status", headerName: "status", dataType: "text" },
  { field: "updated_at", headerName: "updated_at", dataType: "timestamp" },
];

const makeRow = (index: number) => ({
  id: index + 1,
  name: `row_${index + 1}`,
  status: index % 2 === 0 ? "active" : "pending",
  updated_at: new Date(Date.now() - index * 60000).toISOString(),
});

const createDebugRows = (start: number, end: number) =>
  Array.from({ length: Math.max(0, end - start) }, (_, idx) => makeRow(start + idx));

export class MockBackendAdapter implements BackendAdapter {
  async getTables(): Promise<TableIdentifier[]> {
    const tables: TableIdentifier[] = [];
    const walk = (nodes: any[]) => {
      nodes.forEach((n) => {
        if (n.type === "table") {
          const [schema, table] = n.name.split(".");
          tables.push({ backend: "postgres", schema, table: table ?? n.name, label: n.name });
        }
        if (n.children?.length) walk(n.children);
      });
    };
    walk(DB_SCHEMA);
    return tables;
  }

  async getTableColumns(): Promise<TableColumnMeta[]> {
    return DEBUG_COLUMNS;
  }

  async getTableRows(request: TableRowsRequest, signal?: AbortSignal): Promise<TableRowsResponse> {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    await new Promise((r) => setTimeout(r, 150));
    const rows = createDebugRows(request.startRow, request.endRow);
    return { rows, lastRow: 100000 };
  }
}

export const backendRegistry: Record<string, BackendAdapter> = {
  postgres: new MockBackendAdapter(),
  mysql: new MockBackendAdapter(),
  mariadb: new MockBackendAdapter(),
  sqlite: new MockBackendAdapter(),
  oracle: new MockBackendAdapter(),
  mssql: new MockBackendAdapter(),
  mock: new MockBackendAdapter(),
};
