import { Icon } from "@blueprintjs/core";
import "bootstrap-icons/font/bootstrap-icons.css";
import type { TableDef } from "./types";

export default function TableNode({ data }: { data: TableDef }) {
  return (
    <div className="react-flow__node-tableNode bp5-ui-text min-w-[240px] overflow-hidden rounded border border-slate-400 bg-slate-50 shadow-md">
      <div className="flex items-center gap-2 border-b border-slate-300 bg-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-800">
        <Icon icon="th" size={14} />
        {data.schema}.{data.name}
      </div>

      <div className="divide-y divide-slate-200 px-2 py-1">
        {data.columns.map((col, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 text-[11px]">
            <div className="flex items-center gap-2">
              {col.isPrimary ? (
                <i className="bi bi-key-fill text-[12px] text-amber-700" />
              ) : col.isForeign ? (
                <Icon icon="link" size={12} color="#0F6BBD" />
              ) : (
                <span className="inline-block w-3" />
              )}

              <span className={col.isPrimary ? "font-semibold text-slate-900" : "text-slate-800"}>{col.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">{col.type}</span>
              {col.notNull && <span className="rounded bg-slate-200 px-1 text-[9px] text-slate-700">NOT NULL</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
