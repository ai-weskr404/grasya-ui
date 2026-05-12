import { useEffect, useMemo, useState } from "react";
import { Icon } from "@blueprintjs/core";

export interface MigrationTableState {
  table: string;
  status: "accessible" | "syncing" | "degraded";
  readAvailable: boolean;
  lastLatencyMs: number;
}

interface Props {
  isRunning: boolean;
  onOpenTable: (tableName: string) => void;
}

export function MigrationMonitoringView({ isRunning, onOpenTable }: Props) {
  const [progress, setProgress] = useState(22);
  const [logs, setLogs] = useState<string[]>(["Migration monitor initialized."]);
  const [tables, setTables] = useState<MigrationTableState[]>([
    { table: "public.customers", status: "accessible", readAvailable: true, lastLatencyMs: 18 },
    { table: "public.orders", status: "syncing", readAvailable: true, lastLatencyMs: 26 },
    { table: "public.order_items", status: "syncing", readAvailable: true, lastLatencyMs: 33 },
    { table: "public.payments", status: "degraded", readAvailable: true, lastLatencyMs: 72 },
  ]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => (isRunning ? Math.min(99, p + Math.random() * 2.5) : p));
      setTables((prev) =>
        prev.map((t) => ({
          ...t,
          lastLatencyMs: Math.max(10, Math.round(t.lastLatencyMs + (Math.random() * 10 - 5))),
          status: t.lastLatencyMs > 65 ? "degraded" : t.status === "syncing" && Math.random() > 0.8 ? "accessible" : t.status,
        })),
      );
      setLogs((prev) => [
        `Read checks: ${new Date().toLocaleTimeString()} • accessible=${tables.filter((t) => t.readAvailable).length}/${tables.length}`,
        ...prev,
      ].slice(0, 8));
    }, 1800);
    return () => window.clearInterval(id);
  }, [isRunning, tables]);

  const accessible = useMemo(() => tables.filter((t) => t.readAvailable).length, [tables]);

  return (
    <div className="h-full bg-slate-50 p-3 overflow-auto">
      <div className="grid grid-cols-4 gap-3 mb-3">
        <Stat title="Database state" value={isRunning ? "Migrating" : "Idle"} />
        <Stat title="Migration progress" value={`${progress.toFixed(1)}%`} />
        <Stat title="Read availability" value={`${accessible}/${tables.length} tables`} />
        <Stat title="Syncing tables" value={`${tables.filter((t) => t.status === "syncing").length}`} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <section className="col-span-2 border border-slate-300 rounded bg-white">
          <div className="px-3 py-2 border-b text-sm font-semibold">Accessible Tables During Migration</div>
          <table className="w-full text-xs">
            <thead className="bg-slate-100"><tr><th className="text-left px-2 py-1">Table</th><th>Status</th><th>Read</th><th>Latency</th><th /></tr></thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.table} className="border-t">
                  <td className="px-2 py-1">{t.table}</td>
                  <td>{t.status}</td>
                  <td>{t.readAvailable ? "Available" : "Unavailable"}</td>
                  <td>{t.lastLatencyMs}ms</td>
                  <td><button className="text-blue-600" onClick={() => onOpenTable(t.table)}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="border border-slate-300 rounded bg-white">
          <div className="px-3 py-2 border-b text-sm font-semibold">Migration Logs / Query Accessibility</div>
          <div className="p-2 space-y-1 text-xs text-slate-700">
            {logs.map((log, i) => <div key={`${log}-${i}`} className="flex gap-1 items-start"><Icon icon="dot" size={10} className="mt-1" />{log}</div>)}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return <div className="border border-slate-300 rounded bg-white p-3"><div className="text-[11px] text-slate-500">{title}</div><div className="text-lg font-semibold">{value}</div></div>;
}
