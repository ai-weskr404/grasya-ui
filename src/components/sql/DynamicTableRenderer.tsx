import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@blueprintjs/core";
import { createGrid, type GridApi, type ColDef, type IDatasource, type IGetRowsParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { backendRegistry } from "./backendAdapters";
import type { TableIdentifier } from "./types";

interface Props { table: TableIdentifier }

export function DynamicTableRenderer({ table }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<GridApi | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, any[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const adapter = useMemo(() => backendRegistry[table.backend] ?? backendRegistry.mock, [table.backend]);

  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      setError(null);
      setIsLoading(true);
      const columns = await adapter.getTableColumns(table);
      if (!mounted || !hostRef.current) return;
      if (columns.length === 0) setIsDebugMode(true);
      const colDefs: ColDef[] = (columns.length ? columns : [{ field: "placeholder", headerName: "placeholder" }]).map((c) => ({
        field: c.field,
        headerName: c.headerName,
        sortable: true,
        filter: true,
        resizable: true,
      }));

      const datasource: IDatasource = {
        getRows: (params: IGetRowsParams) => {
          const cacheKey = JSON.stringify({ s: params.startRow, e: params.endRow, so: params.sortModel, f: params.filterModel });
          const cached = cacheRef.current.get(cacheKey);
          if (cached) {
            params.successCallback(cached, 100000);
            return;
          }
          if (abortRef.current) abortRef.current.abort();
          abortRef.current = new AbortController();
          const signal = abortRef.current.signal;
          window.setTimeout(async () => {
            try {
              const response = await adapter.getTableRows({
                table,
                startRow: params.startRow,
                endRow: params.endRow,
                sortModel: params.sortModel as any,
                filterModel: params.filterModel,
              }, signal);
              cacheRef.current.set(cacheKey, response.rows);
              params.successCallback(response.rows, response.lastRow);
            } catch (e) {
              if ((e as Error).name !== "AbortError") {
                setError("Failed to load rows.");
                params.failCallback();
              }
            } finally {
              setIsLoading(false);
            }
          }, 180);
        },
      };

      const api = createGrid(hostRef.current, {
        columnDefs: colDefs,
        rowModelType: "infinite",
        datasource,
        cacheBlockSize: 100,
        maxBlocksInCache: 5,
        animateRows: false,
      });
      apiRef.current = api;
      setIsLoading(false);
    };
    void setup();
    return () => {
      mounted = false;
      abortRef.current?.abort();
      apiRef.current?.destroy();
      apiRef.current = null;
    };
  }, [adapter, table]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-8 border-b border-slate-200 px-3 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50">
        <div>{table.label} • {table.backend.toUpperCase()}</div>
        {isDebugMode && <div className="text-amber-600 flex items-center gap-1"><Icon icon="warning-sign" size={12} />Debug mock mode</div>}
      </div>
      {error ? (
        <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
      ) : (
        <div className="flex-1 ag-theme-alpine relative">
          {isLoading && <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center text-slate-500 text-xs">Loading rows...</div>}
          <div ref={hostRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
