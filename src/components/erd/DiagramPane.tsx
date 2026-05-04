import { useMemo, useRef, useState } from 'react';
import TableNode from './TableNode';
import type { TableDef } from './types';

const NODE_W = 230;
const NODE_H = 150;

export default function DiagramPane({ tables }: { tables: TableDef[] }) {
  const [offset, setOffset] = useState({ x: 60, y: 40 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const positions = useMemo(
    () => tables.map((_, i) => ({ x: (i % 2) * 420, y: Math.floor(i / 2) * 250 })),
    [tables],
  );

  const edges = useMemo(() => tables.slice(1).map((table, i) => ({ from: positions[i + 1], to: positions[i], label: `FK_${table.name}` })), [tables, positions]);

  const onDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
  };

  return (
    <div className="erd-viewport" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={() => (dragRef.current = null)} onMouseLeave={() => (dragRef.current = null)}>
      <div className="erd-canvas" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
        <svg className="erd-lines">
          {edges.map((edge, idx) => {
            const x1 = edge.from.x + NODE_W;
            const y1 = edge.from.y + NODE_H / 2;
            const x2 = edge.to.x;
            const y2 = edge.to.y + NODE_H / 2;
            const cx = (x1 + x2) / 2;
            return (
              <g key={idx}>
                <path d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`} className="erd-path" />
                <text x={cx - 24} y={(y1 + y2) / 2 - 6} className="erd-label">{edge.label}</text>
              </g>
            );
          })}
        </svg>
        {tables.map((table, i) => (
          <div key={table.id} className="erd-node-wrap" style={{ left: positions[i].x, top: positions[i].y }}>
            <TableNode data={table} />
          </div>
        ))}
      </div>
    </div>
  );
}
