import { useMemo } from "react";
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

export default function DiagramPane({ tables }: { tables: TableDef[] }) {
  const schemas: DatabaseSchemaInfo[] = useMemo(() => {
    const grouped = new Map<string, DatabaseSchemaInfo>();

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
            ? [
                {
                  foreignSchemaName: schemaName,
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

  return (
    <div className="h-full w-full overflow-hidden erd-dot-bg">
      <RelationshipDiagram schemas={schemas} tableColors={TABLE_COLORS} />
    </div>
  );
}
