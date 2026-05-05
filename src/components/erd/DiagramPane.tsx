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

  const edges = useMemo(() => {
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tableKey = (value: string) =>
      value
        .toLowerCase()
        .split('.')
        .filter(Boolean)
        .at(-1)
        ?.replace(/[^a-z0-9]/g, '') ?? '';

    return tables.flatMap((table, tableIndex) => {
      const fkColumns = table.columns.filter((col) => col.isForeign);

      return fkColumns
        .map((fkCol, fkIndex) => {
          const inferredBase = normalize(fkCol.name.replace(/_?id$/i, ''));
          const targetIndex = tables.findIndex((candidate, idx) => {
            if (idx === tableIndex) return false;
            const candidateName = tableKey(candidate.name);
            const explicitTarget = normalize(fkCol.referencesTable ?? '');
            if (explicitTarget) {
              return candidateName === explicitTarget;
            }
            return (
              candidateName === inferredBase ||
              candidateName === `${inferredBase}s` ||
              candidateName.endsWith(inferredBase)
            );
          });

          if (targetIndex < 0) return null;

          return {
            id: `${table.id}-${fkCol.name}-${targetIndex}-${fkIndex}`,
            from: positions[tableIndex],
            to: positions[targetIndex],
            label: `FK_${table.schema}.${table.name}.${fkCol.name}`,
            sourceOffset: 24 + fkIndex * 16,
            targetOffset: 24,
          };
        })
        .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge));
    });
  }, [tables, positions]);

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
          <defs>
            <marker id="erd-one" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
              <path d="M8,0 L8,10" stroke="#106ba3" strokeWidth="1.5" fill="none" />
            </marker>
            <marker id="erd-many" markerWidth="12" markerHeight="12" refX="2" refY="6" orient="auto-start-reverse">
              <path d="M2,6 L10,1 M2,6 L10,11" stroke="#106ba3" strokeWidth="1.4" fill="none" />
            </marker>
          </defs>
          {edges.map((edge, idx) => {
            const x1 = edge.from.x + NODE_W;
            const y1 = edge.from.y + edge.sourceOffset;
            const x2 = edge.to.x;
            const y2 = edge.to.y + edge.targetOffset;
            const midX = x1 + (x2 - x1) / 2;
            return (
              <g key={`${edge.id}-${idx}`}>
                <path
                  d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`}
                  className="erd-path"
                  markerStart="url(#erd-many)"
                  markerEnd="url(#erd-one)"
                />
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
