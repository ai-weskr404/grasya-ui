import { useEffect, useMemo, useRef, useState } from "react";
import {
  RelationshipDiagram,
  type DataType,
  type DatabaseSchemaInfo,
} from "react-erd";
import "react-erd/dist/style.css";
import type { TableDef } from "./types";

const TABLE_COLORS = ["#0F766E", "#2563EB", "#7C3AED", "#B45309", "#BE123C"];

const toDataType = (type: string): DataType => {
  const normalized = type.toLowerCase();
  if (
    [
      "int",
      "integer",
      "bigint",
      "smallint",
      "serial",
      "decimal",
      "float",
      "double",
      "numeric",
    ].some((t) => normalized.includes(t))
  )
    return "number";
  if (["bool"].some((t) => normalized.includes(t))) return "boolean";
  if (["timestamp", "date", "time"].some((t) => normalized.includes(t)))
    return "datetime";
  if (["json", "jsonb", "xml", "ltree"].some((t) => normalized.includes(t)))
    return "hierarchical";
  if (["money"].some((t) => normalized.includes(t))) return "money";
  if (
    ["point", "polygon", "geometry", "geography"].some((t) =>
      normalized.includes(t),
    )
  )
    return "geometric";
  if (
    ["bytea", "blob", "binary", "varbinary"].some((t) => normalized.includes(t))
  )
    return "binary";
  if (["char", "text", "varchar", "uuid"].some((t) => normalized.includes(t)))
    return "text";
  return "other";
};

export default function DiagramPane({
  tables,
  highlightedNodeIds = [],
  highlightedEdgeId,
  onRelationshipHover,
  onRelationshipSelect,
}: {
  tables: TableDef[];
  highlightedNodeIds?: string[];
  highlightedEdgeId?: string | null;
  onRelationshipHover?: (relationshipId: string | null) => void;
  onRelationshipSelect?: (relationshipId: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const minZoom = 0.5;
  const maxZoom = 1.8;
  const step = 0.1;
  const schemas: DatabaseSchemaInfo[] = useMemo(() => {
    const grouped = new Map<string, DatabaseSchemaInfo>();

    tables.forEach((table) => {
      const schemaName = table.schema || "dbo";
      if (!grouped.has(schemaName))
        grouped.set(schemaName, { name: schemaName, tables: [] });

      const primaryKey = table.columns
        .filter((c) => c.isPrimary)
        .map((c) => c.name);

      grouped.get(schemaName)?.tables.push({
        name: table.name,
        primaryKey:
          primaryKey.length <= 1
            ? (primaryKey[0] ?? table.columns[0]?.name ?? "id")
            : primaryKey,
        columns: table.columns.map((column) => ({
          name: column.name,
          type: toDataType(column.type),
          foreignKeys: column.isForeign
            ? [
                {
                  foreignSchemaName: column.referencesSchema ?? schemaName,
                  foreignTableName: column.referencesTable ?? "",
                  foreignColumnName: column.referencesColumn ?? "id",
                  constrained: true,
                },
              ]
            : [],
        })),
      });
    });

    return Array.from(grouped.values());
  }, [tables]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root
      .querySelectorAll(".react-flow__node")
      .forEach((node) => node.classList.remove("mongo-rel-node-highlight"));
    root
      .querySelectorAll(".react-flow__edge")
      .forEach((edge) => edge.classList.remove("mongo-rel-edge-highlight"));

    highlightedNodeIds.forEach((id) => {
      const node = root.querySelector(`.react-flow__node[data-id='${id}']`);
      if (node) node.classList.add("mongo-rel-node-highlight");
    });
    if (highlightedEdgeId) {
      const edge = root.querySelector(
        `.react-flow__edge[data-id='${highlightedEdgeId}']`,
      );
      if (edge) edge.classList.add("mongo-rel-edge-highlight");
    }
  }, [highlightedNodeIds, highlightedEdgeId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onMouseOver = (event: Event) => {
      const edge = (event.target as HTMLElement).closest(
        ".react-flow__edge[data-id]",
      ) as HTMLElement | null;
      if (edge) onRelationshipHover?.(edge.dataset.id ?? null);
    };
    const onMouseOut = (event: Event) => {
      const edge = (event.target as HTMLElement).closest(
        ".react-flow__edge[data-id]",
      ) as HTMLElement | null;
      if (edge) onRelationshipHover?.(null);
    };
    const onClick = (event: Event) => {
      const edge = (event.target as HTMLElement).closest(
        ".react-flow__edge[data-id]",
      ) as HTMLElement | null;
      if (edge?.dataset.id) onRelationshipSelect?.(edge.dataset.id);
    };
    root.addEventListener("mouseover", onMouseOver);
    root.addEventListener("mouseout", onMouseOut);
    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("mouseover", onMouseOver);
      root.removeEventListener("mouseout", onMouseOut);
      root.removeEventListener("click", onClick);
    };
  }, [onRelationshipHover, onRelationshipSelect]);

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden erd-dot-bg">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded border border-slate-300 bg-white/90 p-1 shadow-sm">
        <button type="button" className="rounded px-2 py-1 text-sm hover:bg-slate-100 disabled:opacity-40" onClick={() => setZoom((prev) => Math.max(minZoom, Number((prev - step).toFixed(2))))} disabled={zoom <= minZoom}>−</button>
        <span className="min-w-12 text-center text-xs font-medium text-slate-700">{Math.round(zoom * 100)}%</span>
        <button type="button" className="rounded px-2 py-1 text-sm hover:bg-slate-100 disabled:opacity-40" onClick={() => setZoom((prev) => Math.min(maxZoom, Number((prev + step).toFixed(2))))} disabled={zoom >= maxZoom}>+</button>
      </div>
      <div
        className="h-full w-full"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          width: `${100 / zoom}%`,
          height: `${100 / zoom}%`,
          transition: "transform 160ms ease-out",
        }}
      >
        <RelationshipDiagram schemas={schemas} tableColors={TABLE_COLORS} />
      </div>
    </div>
  );
}
