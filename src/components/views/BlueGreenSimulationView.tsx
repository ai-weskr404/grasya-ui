import { useMemo, useState } from "react";

type Env = "blue" | "green";

type Row = { id: number; sku: string; qty: number; updatedAt: string };

const seed: Row[] = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, sku: `SKU-${1000 + i}`, qty: 20 + i, updatedAt: new Date().toISOString() }));

export function BlueGreenSimulationView() {
  const [active, setActive] = useState<Env>("blue");
  const [blueRows, setBlueRows] = useState<Row[]>(seed);
  const [greenRows, setGreenRows] = useState<Row[]>(seed.map((r) => ({ ...r, qty: r.qty - 2 })));

  const driftCount = useMemo(() => blueRows.filter((b, i) => b.qty !== greenRows[i]?.qty).length, [blueRows, greenRows]);

  const applyTx = () => {
    const mutate = (rows: Row[]) => rows.map((r, i) => (i === 0 ? { ...r, qty: r.qty + 1, updatedAt: new Date().toISOString() } : r));
    if (active === "blue") setBlueRows((p) => mutate(p)); else setGreenRows((p) => mutate(p));
  };

  const sync = () => setGreenRows(blueRows.map((r) => ({ ...r })));

  const renderTable = (rows: Row[], label: string) => (
    <div className="border border-slate-300 rounded bg-white overflow-hidden">
      <div className="px-3 py-2 text-xs font-semibold bg-slate-100 border-b border-slate-200">{label}</div>
      <table className="w-full text-xs">
        <thead><tr className="bg-slate-50"><th>ID</th><th>SKU</th><th>QTY</th><th>UPDATED</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={`${label}-${r.id}`} className="border-t"><td className="px-2">{r.id}</td><td>{r.sku}</td><td>{r.qty}</td><td>{r.updatedAt.slice(11,19)}</td></tr>)}</tbody>
      </table>
    </div>
  );

  return (
    <div className="h-full p-3 space-y-3 bg-slate-50 overflow-auto">
      <div className="flex gap-2 items-center">
        <button className="app-btn border" onClick={() => setActive(active === "blue" ? "green" : "blue")}>Switch Active ({active})</button>
        <button className="app-btn border" onClick={applyTx}>Mock transaction update</button>
        <button className="app-btn border" onClick={sync}>Simulate replication</button>
        <span className="text-xs text-slate-600">Drift rows: {driftCount}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {renderTable(blueRows, "Blue / Active candidate")}
        {renderTable(greenRows, "Green / Standby")}
      </div>
    </div>
  );
}
