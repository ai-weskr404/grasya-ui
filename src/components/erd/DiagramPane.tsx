import { Tag } from '@blueprintjs/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import TableNode from './TableNode';
import type { TableDef } from './types';

const NODE_W = 250;
const ROW_H = 24;
const HEADER_H = 32;
const PADDING = 80;
const CANVAS_W = 2400;
const CANVAS_H = 1800;

type EdgeDef = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  dangling?: boolean;
  badgeAt?: { x: number; y: number };
};

export default function DiagramPane({ tables }: { tables: TableDef[] }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 60, y: 40 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const positions = useMemo(
    () => tables.map((_, i) => ({ x: (i % 2) * 500 + 40, y: Math.floor(i / 2) * 300 + 40 })),
    [tables],
  );

  useEffect(() => {
    if (!tables.length || !viewportRef.current) return;
    const minX = Math.min(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxX = Math.max(...positions.map((p, i) => p.x + NODE_W));
    const maxY = Math.max(...positions.map((p, i) => p.y + HEADER_H + tables[i].columns.length * ROW_H + 16));

    const viewW = viewportRef.current.clientWidth;
    const viewH = viewportRef.current.clientHeight;

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    setOffset({
      x: Math.max(PADDING, (viewW - contentW) / 2 - minX),
      y: Math.max(PADDING / 2, (viewH - contentH) / 2 - minY),
    });
  }, [tables, positions]);

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
      return table.columns
        .map((col, columnIndex) => {
          if (!col.isForeign) return null;
          const inferredBase = normalize(col.name.replace(/_?id$/i, ''));
          const explicitTarget = normalize(col.referencesTable ?? '');
          const targetIndex = tables.findIndex((candidate, idx) => {
            if (idx === tableIndex) return false;
            const candidateName = tableKey(candidate.name);
            if (explicitTarget) return candidateName === explicitTarget;
            return (
              candidateName === inferredBase ||
              candidateName === `${inferredBase}s` ||
              candidateName.endsWith(inferredBase)
            );
          });

          const x1 = positions[tableIndex].x + NODE_W;
          const y1 = positions[tableIndex].y + HEADER_H + columnIndex * ROW_H + ROW_H / 2;

          if (targetIndex < 0) {
            const x2 = Math.min(x1 + 180, CANVAS_W - 24);
            return {
              id: `${table.id}-${col.name}-dangling`,
              from: { x: x1, y: y1 },
              to: { x: x2, y: y1 },
              dangling: true,
              badgeAt: { x: x2 + 8, y: y1 - 10 },
            } as EdgeDef;
          }

          const targetPkIndex = Math.max(0, tables[targetIndex].columns.findIndex((c) => c.isPrimary));
          const x2 = positions[targetIndex].x;
          const y2 = positions[targetIndex].y + HEADER_H + targetPkIndex * ROW_H + ROW_H / 2;

          return {
            id: `${table.id}-${col.name}-${targetIndex}`,
            from: { x: x1, y: y1 },
            to: { x: x2, y: y2 },
          } as EdgeDef;
        })
        .filter((edge): edge is EdgeDef => Boolean(edge));
    });
  }, [positions, tables]);

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
      <div className="erd-canvas" style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, width: CANVAS_W, height: CANVAS_H }}>
        {tables.map((table, i) => (
          <div key={table.id} className="erd-node-wrap" style={{ left: positions[i].x, top: positions[i].y }}>
            <TableNode data={table} />
          </div>
        ))}
        <svg className="erd-lines" style={{ width: CANVAS_W, height: CANVAS_H }}>
          <defs>
            <marker id="erd-one" markerWidth="16" markerHeight="16" refX="14" refY="8" orient="auto">
              <path d="M13,1 L13,15" stroke="#0B5A8F" strokeWidth="2.4" fill="none" />
            </marker>
            <marker id="erd-many" markerWidth="20" markerHeight="20" refX="4" refY="10" orient="auto-start-reverse">
              <path d="M4,10 L17,2 M4,10 L17,18 M4,10 L17,10" stroke="#0B5A8F" strokeWidth="2.2" fill="none" />
            </marker>
            <linearGradient id="dangling-fade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B5A8F" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0B5A8F" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {edges.map((edge) => (
            <path
              key={edge.id}
              d={`M ${edge.from.x} ${edge.from.y} L ${edge.to.x} ${edge.to.y}`}
              fill="none"
              stroke={edge.dangling ? 'url(#dangling-fade)' : '#0B5A8F'}
              strokeWidth={edge.dangling ? 3 : 3.4}
              strokeDasharray={edge.dangling ? '8 5' : undefined}
              markerStart="url(#erd-many)"
              markerEnd={edge.dangling ? undefined : 'url(#erd-one)'}
            />
          ))}
        </svg>
        {edges
          .filter((edge) => edge.dangling && edge.badgeAt)
          .map((edge) => (
            <div key={`${edge.id}-badge`} className="absolute z-30" style={{ left: edge.badgeAt?.x, top: edge.badgeAt?.y }}>
              <Tag intent="warning" minimal>
                Off-canvas relation
              </Tag>
            </div>
          ))}
      </div>
    </div>
  );
}
