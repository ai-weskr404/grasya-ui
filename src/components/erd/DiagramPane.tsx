import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import TableNode from './TableNode';
import type { TableDef } from './types';

const NODE_W = 230;
const NODE_H = 150;

export default function DiagramPane({ tables }: { tables: TableDef[] }) {
  const [offset, setOffset] = useState({ x: 60, y: 40 });
  const viewportRef = useRef<HTMLDivElement | null>(null);
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
        .map((fkCol) => {
          const fkRowIndex = table.columns.findIndex((col) => col.name === fkCol.name);
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

          const targetPrimaryRowIndex = Math.max(
            tables[targetIndex].columns.findIndex((col) => col.isPrimary),
            0,
          );

          return {
            id: `${table.id}-${fkCol.name}-${targetIndex}`,
            sourceTableIndex: tableIndex,
            targetTableIndex: targetIndex,
            from: positions[tableIndex],
            to: positions[targetIndex],
            label: `FK_${table.schema}.${table.name}.${fkCol.name}`,
            sourceOffset: 32 + fkRowIndex * 20,
            targetOffset: 32 + targetPrimaryRowIndex * 20,
          };
        })
        .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge));
    });
  }, [tables, positions]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || tables.length === 0) return;

    const xs = positions.map((p) => p.x);
    const ys = positions.map((p) => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs) + NODE_W;
    const maxY = Math.max(...ys) + NODE_H;
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const centeredX = (viewport.clientWidth - contentW) / 2 - minX;
    const centeredY = (viewport.clientHeight - contentH) / 2 - minY;

    setOffset({ x: Math.round(centeredX), y: Math.round(centeredY) });
  }, [positions, tables.length]);

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
    <div ref={viewportRef} className="erd-viewport" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={() => (dragRef.current = null)} onMouseLeave={() => (dragRef.current = null)}>
      <div className="erd-canvas" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
        {tables.map((table, i) => (
          <div key={table.id} className="erd-node-wrap" style={{ left: positions[i].x, top: positions[i].y }}>
            <TableNode data={table} />
          </div>
        ))}
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
            const direction = x1 <= x2 ? 1 : -1;
            const laneBase = direction === 1 ? Math.max(x1, x2) : Math.min(x1, x2);
            const laneOffset = 48 + (edge.sourceTableIndex * 13 + edge.targetTableIndex * 17 + idx * 7) % 80;
            const laneX = laneBase + direction * laneOffset;
            return (
              <g key={`${edge.id}-${idx}`}>
                <path
                  d={`M ${x1} ${y1} L ${laneX} ${y1} L ${laneX} ${y2} L ${x2} ${y2}`}
                  className="erd-path"
                  markerStart="url(#erd-many)"
                  markerEnd="url(#erd-one)"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
