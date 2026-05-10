import { useEffect, useMemo, useRef } from "react";
import {
  RelationshipDiagram,
  type DataType,
  type DatabaseSchemaInfo,
} from "react-erd";
import "react-erd/dist/style.css";
import type { TableDef } from "./types";

const TABLE_COLORS = ["#0F766E", "#2563EB", "#7C3AED", "#B45309", "#BE123C"];
const DEFAULT_FALLBACK_SCHEMAS: DatabaseSchemaInfo[] = [
  {
    name: "commerce",
    tables: [
      {
        name: "audiences",
        primaryKey: "id",
        columns: [
          { name: "id", type: "number", foreignKeys: [] },
          { name: "name", type: "text", foreignKeys: [] },
        ],
      },
      {
        name: "customers",
        primaryKey: "id",
        columns: [
          { name: "id", type: "number", foreignKeys: [] },
          { name: "full_name", type: "text", foreignKeys: [] },
          { name: "email", type: "text", foreignKeys: [] },
        ],
      },
      {
        name: "customer_audiences",
        primaryKey: ["customer_id", "audience_id"],
        columns: [
          {
            name: "customer_id",
            type: "number",
            foreignKeys: [{ foreignSchemaName: "commerce", foreignTableName: "customers", foreignColumnName: "id", constrained: true }],
          },
          {
            name: "audience_id",
            type: "number",
            foreignKeys: [{ foreignSchemaName: "commerce", foreignTableName: "audiences", foreignColumnName: "id", constrained: true }],
          },
        ],
      },
      {
        name: "customer_addresses",
        primaryKey: "id",
        columns: [
          { name: "id", type: "number", foreignKeys: [] },
          {
            name: "customer_id",
            type: "number",
            foreignKeys: [{ foreignSchemaName: "commerce", foreignTableName: "customers", foreignColumnName: "id", constrained: true }],
          },
          { name: "is_primary", type: "boolean", foreignKeys: [] },
        ],
      },
      {
        name: "orders",
        primaryKey: "id",
        columns: [
          { name: "id", type: "number", foreignKeys: [] },
          {
            name: "customer_id",
            type: "number",
            foreignKeys: [{ foreignSchemaName: "commerce", foreignTableName: "customers", foreignColumnName: "id", constrained: true }],
          },
        ],
      },
    ],
  },
];

const toDataType = (type: string): DataType => {
  const normalized = type.toLowerCase();
  if (["int", "integer", "bigint", "smallint", "serial", "decimal", "float", "double", "numeric"].some((t) => normalized.includes(t))) return "number";
  if (["bool"].some((t) => normalized.includes(t))) return "boolean";
  if (["timestamp", "date", "time"].some((t) => normalized.includes(t))) return "datetime";
  if (["json", "jsonb", "xml", "ltree"].some((t) => normalized.includes(t))) return "hierarchical";
  if (["money"].some((t) => normalized.includes(t))) return "money";
  if (["point", "polygon", "geometry", "geography"].some((t) => normalized.includes(t))) return "geometric";
  if (["bytea", "blob", "binary", "varbinary"].some((t) => normalized.includes(t))) return "binary";
  if (["char", "text", "varchar", "uuid"].some((t) => normalized.includes(t))) return "text";
  return "other";
};

export default function DiagramPane({
  tables,
  highlightedNodeIds = [],
  highlightedEdgeId = null,
  onRelationshipHover,
  onRelationshipSelect,
}: {
  tables: TableDef[];
  highlightedNodeIds?: string[];
  highlightedEdgeId?: string | null;
  onRelationshipHover?: (edgeId: string | null) => void;
  onRelationshipSelect?: (edgeId: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const schemas: DatabaseSchemaInfo[] = useMemo(() => {
    if (tables.length === 0) return DEFAULT_FALLBACK_SCHEMAS;

    const grouped = new Map<string, DatabaseSchemaInfo>();
    const availableTableRefs = new Set(
      tables.map((table) => `${(table.schema || "dbo").toLowerCase()}.${table.name.toLowerCase()}`),
    );

    tables.forEach((table) => {
      const schemaName = table.schema || "dbo";
      if (!grouped.has(schemaName)) grouped.set(schemaName, { name: schemaName, tables: [] });

      const primaryKey = table.columns.filter((c) => c.isPrimary).map((c) => c.name);

      grouped.get(schemaName)?.tables.push({
        name: table.name,
        primaryKey: primaryKey.length <= 1 ? (primaryKey[0] ?? table.columns[0]?.name ?? "id") : primaryKey,
        columns: table.columns.map((column) => ({
          name: column.name,
          type: toDataType(column.type),
          foreignKeys: column.isForeign
            ? (() => {
                const foreignSchemaName = column.referencesSchema ?? schemaName;
                const foreignTableName = column.referencesTable ?? "";
                const targetRef = `${foreignSchemaName.toLowerCase()}.${foreignTableName.toLowerCase()}`;
                if (!foreignTableName || !availableTableRefs.has(targetRef)) return [];
                return [{
                  foreignSchemaName,
                  foreignTableName,
                  foreignColumnName: column.referencesColumn ?? "id",
                  constrained: true,
                }];
              })()
            : [],
        })),
      });
    });

    const resolvedSchemas = Array.from(grouped.values()).filter((schema) => schema.tables.length > 0);
    return resolvedSchemas.length > 0 ? resolvedSchemas : DEFAULT_FALLBACK_SCHEMAS;
  }, [tables]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll(".react-flow__node").forEach((node) => node.classList.remove("mongo-rel-node-highlight"));
    root.querySelectorAll(".react-flow__edge").forEach((edge) => edge.classList.remove("mongo-rel-edge-highlight"));

    const highlightedNodeSet = new Set(highlightedNodeIds);
    root.querySelectorAll(".react-flow__node[data-id]").forEach((node) => {
      const id = node.getAttribute("data-id");
      if (id && highlightedNodeSet.has(id)) node.classList.add("mongo-rel-node-highlight");
    });
    root.querySelectorAll(".react-flow__edge[data-id]").forEach((edge) => {
      const id = edge.getAttribute("data-id");
      if (id && highlightedEdgeId === id) edge.classList.add("mongo-rel-edge-highlight");
    });
  }, [highlightedNodeIds, highlightedEdgeId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onMouseOver = (event: Event) => {
      const edge = (event.target as HTMLElement).closest(".react-flow__edge[data-id]") as HTMLElement | null;
      if (edge) onRelationshipHover?.(edge.dataset.id ?? null);
    };
    const onMouseOut = (event: Event) => {
      const edge = (event.target as HTMLElement).closest(".react-flow__edge[data-id]") as HTMLElement | null;
      if (edge) onRelationshipHover?.(null);
    };
    const onClick = (event: Event) => {
      const edge = (event.target as HTMLElement).closest(".react-flow__edge[data-id]") as HTMLElement | null;
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
    <div ref={rootRef} className="h-full w-full overflow-hidden erd-dot-bg">
      <RelationshipDiagram schemas={schemas} tableColors={TABLE_COLORS} />
    </div>
  );
}
