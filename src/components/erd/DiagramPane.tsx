import TableNode from './TableNode';
import type { TableDef } from './types';

export default function DiagramPane({ tables }: { tables: TableDef[] }) {
  const positions = tables.map((_, i) => ({ left: i % 2 === 0 ? 80 : 460, top: 40 + Math.floor(i / 2) * 260 }));

  return (
    <div className="erd-pane">
      <svg className="erd-lines">
        {tables.slice(1).map((table, i) => {
          const from = positions[i + 1];
          const to = positions[i];
          return (
            <g key={`${table.id}-${i}`}>
              <path d={`M ${from.left + 110} ${from.top} C ${from.left + 110} ${from.top - 40}, ${to.left + 110} ${to.top + 200}, ${to.left + 110} ${to.top + 170}`} className="erd-path" />
              <text x={(from.left + to.left) / 2 + 80} y={(from.top + to.top) / 2 + 70} className="erd-label">FK_{table.name}</text>
            </g>
          );
        })}
      </svg>
      {tables.map((table, i) => (
        <div key={table.id} className="erd-node-wrap" style={{ left: positions[i].left, top: positions[i].top }}>
          <TableNode data={table} />
        </div>
      ))}
    </div>
  );
}
